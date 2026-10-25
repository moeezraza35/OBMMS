import React, { useEffect, useState } from "react";
import { checkFrontendUpdate, applyFrontendUpdate } from "../utils/updateManager";

export default function UpdateNotifier() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    checkFrontendUpdate().then((info) => {
      if (isMounted && info.hasUpdate) {
        setUpdateInfo(info);
      }
    });

    // Check periodically every hour
    const interval = setInterval(() => {
      checkFrontendUpdate().then((info) => {
        if (isMounted && info.hasUpdate) {
          setUpdateInfo(info);
        }
      });
    }, 3600000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!updateInfo || !updateInfo.hasUpdate || dismissed) {
    return null;
  }

  const handleUpdate = () => {
    setUpdating(true);
    applyFrontendUpdate();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md bg-white border border-teal-500 shadow-xl rounded-lg p-4 animate-bounce-short">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-teal-100 text-teal-700 rounded-full">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-sm">
            Update Available! ({updateInfo.latestVersion})
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            A new version of OBMMS Frontend is available. Update now to get the
            latest features and fixes.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition"
            >
              {updating ? "Updating..." : "Update Now"}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
