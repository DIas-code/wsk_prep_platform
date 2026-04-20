import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ContentProvider } from "./ui/ContentContext";
import { createViteContentLoader } from "./content/createViteContentLoader";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { ModulePage } from "./pages/ModulePage";
import { TaskPage } from "./pages/TaskPage";

const loader = createViteContentLoader();

export function App() {
  return (
    <ContentProvider loader={loader}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/m/:moduleId" element={<ModulePage />} />
          <Route path="/m/:moduleId/l/:lessonId" element={<LessonPage />} />
          <Route path="/m/:moduleId/t/:taskId" element={<TaskPage />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  );
}
