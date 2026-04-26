import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ContentProvider } from "./ui/ContentContext";
import { createViteContentLoader } from "./content/createViteContentLoader";
import { AppShell } from "./ui/AppShell";
import { CheatSheetPage } from "./pages/CheatSheetPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { ModulePage } from "./pages/ModulePage";
import { TaskPage } from "./pages/TaskPage";

const loader = createViteContentLoader();

export function App() {
  return (
    <ContentProvider loader={loader}>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cheatsheet" element={<CheatSheetPage />} />
            <Route path="/m/:moduleId" element={<ModulePage />} />
            <Route path="/m/:moduleId/l/:lessonId" element={<LessonPage />} />
            <Route path="/m/:moduleId/t/:taskId" element={<TaskPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ContentProvider>
  );
}
