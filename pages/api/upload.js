import formidable from "formidable";
import fs from "fs";
import mime from "mime-types";
import { fileRouter } from "../../utils/fileRouter";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "解析失败" });

    // 兼容单文件和多文件上传
    const fileList = Array.isArray(files.file) ? files.file : [files.file];

    try {
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      const repo = "keaeye/file-eo";
      const githubApiBase = `https://api.github.com/repos/${repo}/contents`;

      for (const file of fileList) {
        const buffer = fs.readFileSync(file.filepath);
        const content = buffer.toString("base64");
        const fileName = file.originalFilename;
        const mimeType = mime.lookup(fileName);
        const uploadPath = fileRouter(fileName, mimeType);

        const url = `${githubApiBase}/${uploadPath}/${fileName}`;

        // 先查询是否存在该文件，获取 sha（更新文件需要）
        let sha = undefined;
        const checkResp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            "User-Agent": "VercelUploader",
          },
        });
        if (checkResp.ok) {
          const data = await checkResp.json();
          sha = data.sha;
        }

        const putResp = await fetch(url, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            "User-Agent": "VercelUploader",
          },
          body: JSON.stringify({
            message: `上传文件：${fileName}`,
            content,
            sha,
          }),
        });

        if (!putResp.ok) {
          const text = await putResp.text();
          throw new Error(text);
        }
      }

      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message || "上传失败" });
    }
  });
}
