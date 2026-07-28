import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BoardPage } from '../pages/BoardPage';
import { CreateBugModal } from '../pages/CreateBugModal';
import { EditBugModal } from '../pages/EditBugModal';

type PagesFixtures = {
  loginPage: LoginPage;
  boardPage: BoardPage;
  createBugModal: CreateBugModal;
  editBugModal: EditBugModal;
};

export const test = base.extend<PagesFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  boardPage: async ({ page }, use) => {
    const boardPage = new BoardPage(page);
    await use(boardPage);
  },

  createBugModal: async ({ page }, use) => {
    const modal = new CreateBugModal(page);
    await use(modal);
  },

  editBugModal: async ({ page }, use) => {
    const modal = new EditBugModal(page);
    await use(modal);
  },
});

export { expect } from '@playwright/test';
