import { useState, useRef } from "react";
import axios from "axios";

interface UploadHistoryItem {
  name: string;
  path: string;
  date: string;
  status: "success" | "fail";
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<UploadHistoryItem[]>(
    () => JSON.parse(localStorage.getItem("upload-history") || "[]")
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            setProgress((prev) => ({
              ...prev,
              [file.name]: Math.round((e.loaded * 100) / (e.total || 1)),
            }));
          },
        });

        const record: UploadHistoryItem = {
          name: file.name,
          path: "自动分类",
          date: new Date().toLocaleString(),
          status: "success",
        };

        const newHistory = [record, ...history];
        setHistory(newHistory);
        localStorage.setItem("upload-history", JSON.stringify(newHistory));
      } catch (error) {
        const record: UploadHistoryItem = {
          name: file.name,
          path: "自动分类",
          date: new Date().toLocaleString(),
          status: "fail",
        };
        const newHistory = [record, ...history];
        setHistory(newHistory);
        localStorage.setItem("upload-history", JSON.stringify(newHistory));
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📤 上传文件到 GitHub</h1>

      <input
        type="file"
        multiple
        className="mb-4"
        ref={inputRef}
        onChange={handleFileChange}
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        上传
      </button>

      <div className="mt-6 space-y-2">
        {files.map((file) => (
          <div key={file.name} className="text-sm">
            <strong>{file.name}</strong> - {progress[file.name] || 0}%
            <div className="h-2 bg-gray-200 rounded mt-1">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${progress[file.name] || 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <hr className="my-6" />

      <h2 className="text-lg font-semibold mb-2">📜 上传历史</h2>
      <ul className="text-sm space-y-1">
        {history.map((item, idx) => (
          <li key={idx}>
            {item.status === "success" ? "✅" : "❌"} <strong>{item.name}</strong>{" "}
            上传于 <em>{item.date}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
