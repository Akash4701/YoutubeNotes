'use client'
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

function App() {
  const docs = [
    { uri: "https://res.cloudinary.com/dno7xkjeu/raw/upload/v1757967020/unj6apjbwutnnmjpyigd.pdf" }, // Remote file
    
  ];

  return <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />;
}
export default App