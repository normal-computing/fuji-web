/**
 * Requests user permission for microphone access.
 * @returns {Promise<void>} A Promise that resolves when permission is granted or rejects with an error.
 */
export async function getUserPermission(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Using navigator.mediaDevices.getUserMedia to request microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Permission granted, handle the stream if needed
        console.log("Microphone access granted");

        // Stop the tracks to prevent the recording indicator from being shown
        stream.getTracks().forEach(function (track) {
          track.stop();
        });

        resolve();
      })
      .catch((error) => {
        console.error("Error requesting microphone permission", error);

        // Handling different error scenarios
        if (error.name === "Permission denied") {
          // TODO: catch this error and show a user-friendly message
          reject(new Error("MICROPHONE_PERMISSION_DENIED"));
        } else {
          reject(error);
        }
      });
  });
}

// Call the function to request microphone permission
getUserPermission();
