// Code from https://plainenglish.io/blog/how-to-create-download-and-upload-files-in-react-apps
import { useState, useEffect, useRef, ChangeEvent } from 'react';

export interface UseFileBackupOptions<T> {
  /** Callback invoked when a backup file is successfully uploaded and parsed */
  onLoad: (loadedData: T) => void;
  /** Prefix for the downloaded backup filename (default: 'kanaState') */
  fileNamePrefix?: string;
}

/**
 * Custom hook to export state as a downloadable JSON file and import it back via FileReader.
 *
 * Encapsulates:
 * - Hidden anchor element reference and lifecycle (Blob URL creation/revocation) for downloading.
 * - Hidden file input element reference and FileReader parsing for uploading.
 */
export function useFileBackup<T>({ onLoad, fileNamePrefix = 'kanaState' }: UseFileBackupOptions<T>) {
  const [fileDownloadUrl, setFileDownloadUrl] = useState<string | null>(null);
  const fileDownloadRef = useRef<HTMLAnchorElement>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  /**
   * Serializes data to JSON, creates an Object URL, and schedules a file download.
   */
  function saveState(data: unknown) {
    console.log('saveState');
    const output = JSON.stringify(data);
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    setFileDownloadUrl(url);
  }

  /**
   * Programmatically opens the browser file picker by triggering the hidden input element.
   */
  function loadState() {
    fileUploadRef.current?.click();
  }

  /**
   * Handles user file selection from the hidden file input, parsing JSON and invoking onLoad.
   */
  function openFile(e: ChangeEvent<HTMLInputElement>) {
    const fileObj = e.target.files?.[0];
    if (!fileObj) {
      return;
    }

    const reader = new FileReader();
    const fileloaded = (ev: ProgressEvent<FileReader>) => {
      try {
        const fileContents = ev.target?.result as string;
        const loadedState = JSON.parse(fileContents) as T;
        console.log({ fileContents });
        onLoad(loadedState);
      } catch (err) {
        console.error('Failed to parse state file:', err);
      }
    };

    reader.onload = fileloaded;
    reader.readAsText(fileObj);
  }

  /**
   * Trigger the actual download via synthetic click once the Object URL is created,
   * then revoke the URL to prevent memory leaks.
   */
  useEffect(() => {
    if (fileDownloadUrl && fileDownloadRef.current) {
      fileDownloadRef.current.setAttribute(
        'download',
        `${fileNamePrefix}_${new Date(Date.now()).toISOString()}.txt`
      );
      fileDownloadRef.current.click();
      URL.revokeObjectURL(fileDownloadUrl);
      setFileDownloadUrl(null);
    }
  }, [fileDownloadUrl, fileNamePrefix]);

  return {
    saveState,
    loadState,
    openFile,
    fileDownloadUrl,
    fileDownloadRef,
    fileUploadRef,
  };
}
