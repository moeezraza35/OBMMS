import { Alert, Linking, NativeModules, Platform } from 'react-native';
import { version as currentVersion, github_repo } from '../config';

const { AppUpdateModule } = NativeModules;

export interface ReleaseAsset {
  name: string;
  size: number;
  browser_download_url: string;
  content_type: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  assets: ReleaseAsset[];
}

/**
 * Parses numerical version tuple from tag string.
 * e.g. "mobile-0.0.2" -> [0, 0, 2]
 *      "mobile-v1.0.0" -> [1, 0, 0]
 */
export function parseVersionTuple(tag: string): number[] {
  if (!tag) return [0, 0, 0];
  const cleaned = tag.replace(/^[a-zA-Z_\-]+v?/, '').trim();
  const match = cleaned.match(/(\d+(?:\.\d+)+)/);
  if (!match) return [0, 0, 0];
  return match[1].split('.').map((num) => parseInt(num, 10) || 0);
}

/**
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareVersions(v1: string, v2: string): number {
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
 * Fetches GitHub releases and checks if a newer mobile release exists.
 */
export async function fetchLatestMobileRelease(): Promise<{
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  release?: GitHubRelease;
}> {
  try {
    const res = await fetch(`https://api.github.com/repos/${github_repo}/releases`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      console.warn('GitHub API request failed:', res.statusText);
      return { hasUpdate: false, currentVersion };
    }

    const releases: GitHubRelease[] = await res.json();
    if (!Array.isArray(releases)) {
      return { hasUpdate: false, currentVersion };
    }

    // Filter releases starting with "mobile-"
    const mobileReleases = releases.filter(
      (r) => r.tag_name && r.tag_name.toLowerCase().startsWith('mobile-')
    );

    if (mobileReleases.length === 0) {
      return { hasUpdate: false, currentVersion };
    }

    // Sort descending by version
    mobileReleases.sort((a, b) => compareVersions(b.tag_name, a.tag_name));
    const latestRelease = mobileReleases[0];
    const latestTag = latestRelease.tag_name;

    const hasUpdate = compareVersions(latestTag, currentVersion) > 0;

    return {
      hasUpdate,
      currentVersion,
      latestVersion: latestTag,
      release: latestRelease,
    };
  } catch (error) {
    console.error('Error checking for mobile update:', error);
    return { hasUpdate: false, currentVersion };
  }
}

/**
 * Downloads and installs the update based on platform.
 */
export async function proceedWithUpdate(release: GitHubRelease) {
  if (Platform.OS === 'android') {
    // Locate the APK asset in the release
    const apkAsset = release.assets?.find((asset) =>
      asset.name.toLowerCase().endsWith('.apk')
    );

    if (!apkAsset) {
      Alert.alert(
        'APK Not Found',
        'No APK file found in this release. Opening download page in browser.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Browser', onPress: () => Linking.openURL(release.html_url) },
        ]
      );
      return;
    }

    // Check if install unknown apps permission is granted
    if (AppUpdateModule && AppUpdateModule.canRequestPackageInstalls) {
      try {
        const canInstall = await AppUpdateModule.canRequestPackageInstalls();
        if (!canInstall) {
          Alert.alert(
            'Permission Required',
            'To install the update, please grant permission to install unknown apps for OBMMS in your settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  AppUpdateModule.openInstallPermissionSettings();
                },
              },
            ]
          );
          return;
        }

        // Trigger native download & install
        Alert.alert(
          'Downloading Update',
          'The update is downloading in the background. Check your notification bar for progress. The installer will open when finished.',
          [{ text: 'OK' }]
        );

        await AppUpdateModule.downloadAndInstallApk(
          apkAsset.browser_download_url,
          apkAsset.name
        );
      } catch (err: any) {
        console.error('Failed to trigger APK install:', err);
        Alert.alert(
          'Download Failed',
          'Failed to download update automatically. Would you like to download directly from browser?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Download in Browser',
              onPress: () => Linking.openURL(apkAsset.browser_download_url),
            },
          ]
        );
      }
    } else {
      // Fallback: Open browser download URL
      Linking.openURL(apkAsset.browser_download_url);
    }
  } else if (Platform.OS === 'ios') {
    // iOS updates cannot be sideloaded directly via APK/IPA
    // Redirect user to App Store, TestFlight, or release page
    Alert.alert(
      'iOS Update',
      'Opening release page to download or update the iOS application.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', onPress: () => Linking.openURL(release.html_url) },
      ]
    );
  }
}

/**
 * Main update checker function:
 * Prompts user with Alert if update is available.
 * If user presses OK -> downloads & installs.
 * If user presses Cancel -> does nothing.
 */
export async function checkMobileUpdate(silent: boolean = true) {
  const result = await fetchLatestMobileRelease();

  if (result.hasUpdate && result.release) {
    const { release, latestVersion } = result;
    const notes = release.body ? `\n\nRelease Notes:\n${release.body}` : '';

    Alert.alert(
      'Update Available',
      `A new version (${latestVersion}) of OBMMS is available.${notes}\n\nWould you like to update now?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            console.log('User cancelled update.');
          },
        },
        {
          text: 'OK',
          onPress: () => {
            proceedWithUpdate(release);
          },
        },
      ],
      { cancelable: true }
    );
  } else if (!silent) {
    Alert.alert(
      'No Update Available',
      `You are using the latest version of OBMMS (${result.currentVersion}).`,
      [{ text: 'OK' }]
    );
  }
}
