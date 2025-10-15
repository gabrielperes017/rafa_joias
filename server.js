import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Arquivos estáticos =====
app.use(express.static(path.join(__dirname, "html"))); // HTML na raiz
app.use('/css', express.static(path.join(__dirname, 'style')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/aneis', express.static(path.join(__dirname, 'aneis')));

// ===== Rotas =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "main.html"));
});

app.get("/carrinho", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "carrinho.html"));
});
app.get("/perfil", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "perfil.html"));
});

// ===== Servidor =====
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
