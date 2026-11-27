import { version as currentVersion, github_repo, api_prefix, backend } from "../config";

/**
 * Parses numerical version tuple from tag string.
 * e.g. "frontend-v0.0.3" -> [0, 0, 3]
 *      "frontend-1.0.0"  -> [1, 0, 0]
 */
export function parseVersionTuple(tag) {
  if (!tag) return [0, 0, 0];
  const cleaned = tag.replace(/^[a-zA-Z_-]+v?/, "").trim();
  const match = cleaned.match(/(\d+(?:\.\d+)+)/);
  if (!match) return [0, 0, 0];
  return match[1].split(".").map((num) => parseInt(num, 10) || 0);
}

/**
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareVersions(v1, v2) {
  const t1 = parseVersionTuple(v1);
  const t2 = parseVersionTuple(v2);
  const maxLen = Math.max(t1.length, t2.length);

  for (let i = 0; i < maxLen; i++) {
    const n1 = t1[i] || 0;
    const n2 = t2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}

/**
 * Fetches releases from GitHub and checks for frontend updates.
 */
export async function checkFrontendUpdate() {
  try {
    const res = await fetch(`https://api.github.com/repos/${github_repo}/releases`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      console.warn("Failed to check GitHub releases:", res.statusText);
      return { hasUpdate: false, currentVersion };
    }

    const releases = await res.json();
    if (!Array.isArray(releases)) {
      return { hasUpdate: false, currentVersion };
    }

    const frontendReleases = releases.filter((r) =>
      r.tag_name && r.tag_name.toLowerCase().startsWith("frontend-")
    );

    if (frontendReleases.length === 0) {
      return { hasUpdate: false, currentVersion };
    }

    // Sort descending by semver
    frontendReleases.sort((a, b) => compareVersions(b.tag_name, a.tag_name));
    const latestRelease = frontendReleases[0];
    const latestTag = latestRelease.tag_name;

    const hasUpdate = compareVersions(latestTag, currentVersion) > 0;

    return {
      hasUpdate,
      currentVersion,
      latestVersion: latestTag,
      releaseNotes: latestRelease.body || "",
      publishedAt: latestRelease.published_at,
      releaseUrl: latestRelease.html_url,
      release: latestRelease,
    };
  } catch (err) {
    console.error("Error checking for frontend update:", err);
    return { hasUpdate: false, currentVersion, error: err.message };
  }
}

/**
 * Performs cache busting and reloads page to fetch fresh bundle.
 */
export async function applyFrontendUpdate(session_id = "") {
  const headers = {};
  if (session_id) {
    headers["Authorization"] = `Bearer ${session_id}`;
  }
  const res = await fetch(`${backend}${api_prefix}system/update/frontend`, {
    method: "POST",
    headers,
    credentials: "include",
  });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.detail || body.message || `Update failed (${res.status})`);
  }
  if (body.has_update === false) {
    // already up to date on the backend side
    return body;
  }

  // Give the server a beat to finish the background task, then reload.
  await new Promise((r) => setTimeout(r, 4000));

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  window.location.reload();
}
