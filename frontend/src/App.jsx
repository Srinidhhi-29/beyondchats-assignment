import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/articles")
      .then((res) => setArticles(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>BeyondChats Articles</h1>

      {articles.length === 0 && <p>Loading articles...</p>}

      {articles.map((a) => (
        <div
          key={a.id}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            marginBottom: 20,
            borderRadius: 8,
          }}
        >
          <h2>{a.title}</h2>
          <p>{a.updated_content || a.content}</p>

          {a.references && (
            <p>
              <b>References:</b> {a.references}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
