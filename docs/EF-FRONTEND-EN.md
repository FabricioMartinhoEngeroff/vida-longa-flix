# VidaLongaFlix - Frontend System Functional Specification

## 1. Revision History

| Date       | Revision Summary                                | Author   | Development Forecast |
|------------|------------------------------------------------|----------|----------------------|
| 03/01/2026 | Initial document creation                      | Fabricio | -                    |

---

## 2. System Overview

VidaLongaFlix is a video and meal plan streaming platform focused on health and longevity. The frontend is a Single Page Application (SPA) that allows authenticated users to watch videos, like content, comment, manage favorites, and receive notifications. Administrators manage content directly through the interface, including deletion on public pages.

**Technologies:** Angular 21, TypeScript, Angular Signals, Reactive Forms, Angular Material Icons, Vitest.

**Architecture:** 100% Standalone Components (no NgModules), state management via Signals.

**API base URL (development):** `/api` (proxied to `http://localhost:8090`)

**API base URL (production):** `https://api.vidalongaflix.com.br/api`

---

## 3. Access Profiles

| Profile        | Description                                                               |
|----------------|---------------------------------------------------------------------------|
| ROLE_USER      | Authenticated user with access to content (videos, menus, favorites)      |
| ROLE_ADMIN     | Administrator with full access, including CRUD and deletion on public pages|
| Unauthenticated| Redirected to login/registration page                                     |

---

## 4. General Rules

**GR01** - Authentication uses JWT (JSON Web Token). The token is stored in `localStorage` (persistent session) or `sessionStorage` (temporary session), according to user choice at login.

**GR02** - Only one storage type is used per session. If the user checks "keep me logged in", it uses `localStorage`; otherwise, `sessionStorage`.

**GR03** - The HTTP interceptor automatically adds the `Authorization: Bearer {token}` header to all API requests. Invalid tokens (format other than 3 dot-separated parts) are not sent.

**GR04** - Routes protected by `authGuard` require authentication. Admin routes are protected by `authGuard` + `adminGuard`.

**GR05** - Unauthenticated users are redirected to `/login`. Non-admin users are redirected to `/app` when trying to access admin routes.

**GR06** - Passwords must contain at least 8 characters, including: uppercase letter, lowercase letter, number, and special character. A visual strength indicator is displayed in real time.

**GR07** - All interface texts are in Portuguese (PT-BR).

**GR08** - The system is responsive with a breakpoint at 768px (mobile/desktop).

**GR09** - Form fields with masks (CPF, phone, zip code) automatically format user input and strip the mask before sending to the backend.

**GR10** - Text comparisons (categories, search) are normalized: trim, lowercase, diacritics removal (NFD).

---

## 5. Route Structure

### 5.1 Public Routes (no authentication)

| Route               | Component               | Description             |
|---------------------|--------------------------|-------------------------|
| `/`                 | Redirect                 | Redirects to `/authorization` |
| `/authorization`    | AuthorizationComponent   | Login/Register page     |
| `/login`            | LoginComponent           | Login page              |
| `/register`         | RegisterComponent        | Registration page       |
| `/password-change`  | PasswordChangeComponent  | Password reset page     |
| `/autorizacao`      | AuthorizationComponent   | PT-BR alias             |
| `/registrar`        | RegisterComponent        | PT-BR alias             |
| `/redefinir-senha`  | PasswordChangeComponent  | PT-BR alias             |
| `**`                | NotFoundComponent        | 404 page                |

### 5.2 Authenticated Routes (authGuard)

| Route               | Component           | Description              |
|---------------------|----------------------|--------------------------|
| `/app`              | BasePageComponent    | Main layout (container)  |
| `/app/` (index)     | HomeComponent        | Video feed by category   |
| `/app/favorites`    | FavoritesComponent   | User favorites           |
| `/app/favoritos`    | FavoritesComponent   | PT-BR alias              |
| `/app/most-viewed`  | MostViewedComponent  | Most watched videos      |
| `/app/mais-vistos`  | MostViewedComponent  | PT-BR alias              |
| `/app/history`      | HomeComponent        | View history             |
| `/app/historico`    | HomeComponent        | PT-BR alias              |
| `/app/menus`        | MenusComponent       | Meal plans by category   |
| `/app/cardapios`    | MenusComponent       | PT-BR alias              |

### 5.3 Admin Routes (authGuard + adminGuard)

| Route               | Component           | Description              |
|---------------------|----------------------|--------------------------|
| `/app/video-admin`  | VideoAdminComponent  | Video management         |
| `/app/menu-admin`   | MenuAdminComponent   | Menu management          |

---

## 6. Authentication Module

### 6.1 Login

**Component:** `LoginComponent`

**Route:** `/login`

**Description:** Authenticates the user with email and password. On successful login, redirects to `/app`.

**Form fields:**

| Field        | Type     | Required | Validation              |
|--------------|----------|----------|--------------------------|
| email        | email    | Yes      | Valid email format       |
| password     | password | Yes      | Minimum 6 characters     |
| keepLoggedIn | checkbox | No       | -                        |

**Rules:**

**RL-LOGIN-01** - Email is normalized (trim + lowercase) before submission.

**RL-LOGIN-02** - If "keep me logged in" is checked, token and user data are saved in `localStorage`. Otherwise, in `sessionStorage`.

**RL-LOGIN-03** - On error, an alert message is displayed via NotificationService.

**Endpoint called:** `POST /api/auth/login`

---

### 6.2 Registration

**Component:** `RegisterComponent`

**Route:** `/register`

**Description:** Registers a new user. After registration, automatically starts a session and redirects to `/app`.

**Form fields:**

| Field    | Type     | Required | Validation                                                       |
|----------|----------|----------|------------------------------------------------------------------|
| name     | text     | Yes      | Minimum 3 characters                                             |
| email    | email    | Yes      | Valid format, rejects temporary and suspicious domains            |
| phone    | tel      | Yes      | 10 or 11 digits, automatic mask (XX) XXXXX-XXXX                  |
| password | password | Yes      | Minimum 8 characters, minimum strength STRONG (upper, lower, number, special) |

**Rules:**

**RL-REG-01** - Temporary domain emails (e.g., guerrillamail, tempmail) are rejected with a specific message.

**RL-REG-02** - Suspicious emails (unusual patterns) receive a visual warning via `EmailAdjustmentMessageComponent`.

**RL-REG-03** - Password strength is displayed in real time by `PasswordStrengthIndicatorComponent` with a colored bar and list of missing requirements.

**RL-REG-04** - Phone number is automatically masked and normalized before submission.

**Endpoint called:** `POST /api/auth/register`

---

### 6.3 Password Recovery

**Component:** `PasswordRecoveryComponent` (modal inside LoginComponent)

**Description:** Sends password recovery email.

**Fields:**

| Field | Type  | Required | Validation              |
|-------|-------|----------|--------------------------|
| email | email | Yes      | Valid email format       |

**Endpoint called:** `POST /api/auth/password-recovery`

---

### 6.4 Password Reset

**Component:** `PasswordChangeComponent`

**Route:** `/password-change`

**Description:** Allows password reset using a token sent by email.

**Fields:**

| Field           | Type     | Required | Validation                                    |
|-----------------|----------|----------|-----------------------------------------------|
| newPassword     | password | Yes      | Minimum 8 characters, minimum strength STRONG  |
| confirmPassword | password | Yes      | Must match newPassword                         |

**Rules:**

**RL-PWD-01** - The token is validated on page load. Invalid tokens display an error message.

**RL-PWD-02** - Passwords must be identical. Otherwise, displays "Passwords do not match".

---

### 6.5 Authenticated User Session

**Service:** `AuthService`

**Description:** Manages the application's authentication state.

**Endpoints called:**

| Method                      | Endpoint                    | Description                  |
|-----------------------------|-----------------------------|------------------------------|
| `login()`                   | `POST /api/auth/login`      | Authenticate user            |
| `register()`                | `POST /api/auth/register`   | Register user                |
| `fetchAuthenticatedUser()`  | `GET /api/users/me`         | Retrieve logged-in user data |
| `logout()`                  | None (local)                | Clear storage, redirect      |

**Observables/State:**

| Property | Type                        | Description                     |
|----------|-----------------------------|---------------------------------|
| `user$`  | `Observable<User \| null>`  | Observable of authenticated user|
| `user`   | `User \| null`              | Synchronous user getter         |

---

### 6.6 HTTP Interceptor

**File:** `auth.interceptor.ts`

**Description:** Functional interceptor that adds the authorization header.

**Rules:**

**RL-INT-01** - Only adds the header to requests targeting the API base URL (`environment.apiUrl`).

**RL-INT-02** - Validates JWT format (3 dot-separated parts). Invalid, empty, "null", or "undefined" tokens are not sent.

---

### 6.7 Guards

**authGuard:**
- Checks `authService.isAuthenticated()` (token existence)
- Redirects to `/login` if not authenticated

**adminGuard:**
- Checks if the user has `ROLE_ADMIN` in the `roles` array
- Redirects to `/authorization` if no user exists
- Redirects to `/app` if not admin

---

## 7. Main Layout

### 7.1 Base Page (Container)

**Component:** `BasePageComponent`

**Route:** `/app`

**Description:** Main container that wraps all authenticated pages.

**Composition:**

| Component                 | Position | Description                          |
|---------------------------|----------|--------------------------------------|
| `HeaderComponent`         | Top      | Top bar with search and user menu    |
| `NavbarComponent`         | Side     | Navigation menu                      |
| `RouterOutlet`            | Center   | Active page content                  |
| `FooterComponent`         | Bottom   | Application footer                   |
| `VideoZoomModalComponent` | Overlay  | Global video modal                   |

---

### 7.2 Header

**Component:** `HeaderComponent`

**Description:** Top bar with search field, user menu, and notifications.

**Composition:**

| Component               | Description                                    |
|--------------------------|------------------------------------------------|
| `SearchFieldComponent`   | Search input with autocomplete                  |
| `UserMenuComponent`      | User dropdown menu (photo, profile, logout)     |
| `NotificationsComponent` | Notification bell with unread badge              |

**Search Functionality:**

**RL-SEARCH-01** - Indexes all videos and menus loaded in memory.

**RL-SEARCH-02** - Removes Portuguese stop words and normalizes diacritics.

**RL-SEARCH-03** - Results are ranked by relevance (token matching).

**RL-SEARCH-04** - Selecting a result navigates to the corresponding page with query params (`tipo`, `id`, `cat`, `q`) and auto-scrolls to the item.

---

### 7.3 Navbar

**Component:** `NavbarComponent`

**Description:** Side navigation menu.

**Menu Items:**

| Item              | Icon          | Route               | Admin Only |
|-------------------|---------------|----------------------|------------|
| Home              | home          | /app                 | No         |
| Menus             | restaurant    | /app/menus           | No         |
| Favorites         | favorite      | /app/favorites       | No         |
| History           | history       | /app/history         | No         |
| Most Viewed       | trending_up   | /app/most-viewed     | No         |
| Reels             | movie         | /app                 | No         |
| Add Videos        | video_call    | /app/video-admin     | Yes        |
| Menu Admin        | restaurant_menu| /app/menu-admin     | Yes        |

**Rules:**

**RL-NAV-01** - Items marked as `adminOnly` are only displayed when the user has `ROLE_ADMIN`.

**RL-NAV-02** - The active item is highlighted based on the current route.

---

### 7.4 User Menu

**Component:** `UserMenuComponent`

**Description:** Dropdown with user photo, name, and actions.

**Features:**

| Action            | Description                                              |
|-------------------|----------------------------------------------------------|
| Change photo      | File picker or drag-and-drop (max 2MB, images only)      |
| Edit profile      | Opens `UserProfileModalComponent`                        |
| Change password   | Opens `ChangePasswordModalComponent`                     |
| Logout            | Opens confirmation modal, calls `authService.logout()`    |

---

### 7.5 User Profile

**Component:** `UserProfileModalComponent`

**Description:** Modal for editing the user profile.

**Form fields:**

| Field              | Type  | Required | Mask     | Validation           |
|--------------------|-------|----------|----------|----------------------|
| name               | text  | Yes      | -        | Minimum 3 characters |
| email              | email | Yes      | -        | Valid format         |
| taxId              | text  | No       | CPF      | Minimum 11 digits    |
| phone              | tel   | No       | Phone    | -                    |
| address.street     | text  | No       | -        | -                    |
| address.number     | text  | No       | -        | -                    |
| address.neighborhood| text | No       | -        | -                    |
| address.city       | text  | No       | -        | -                    |
| address.state      | text  | No       | -        | -                    |
| address.zipCode    | text  | No       | Zip code | -                    |

---

### 7.6 Notifications

**Component:** `NotificationsComponent`

**Description:** Dropdown for new content notifications (videos and menus).

**Features:**

| Feature              | Description                                        |
|----------------------|----------------------------------------------------|
| Unread badge         | Counter displayed over the bell icon               |
| Tab filtering        | All / Unread / Read                                 |
| Pagination           | 10 items per page, "Load more" button               |
| Mark all as read     | Button to clear all notifications                   |
| Click notification   | Marks as read and navigates to content              |

**Storage:** `localStorage` with key `vlflix:content-notifications:v1` (maximum 200 items).

**Rules:**

**RL-NOT-01** - Notifications are generated locally when a video or menu is created by admin.

**RL-NOT-02** - Date and time are formatted in `pt-BR` locale.

---

## 8. Videos Module (Home)

### 8.1 Video Feed

**Component:** `HomeComponent`

**Route:** `/app`

**Description:** Main page displaying all videos grouped by category in horizontal carousels.

**Visual Structure:**

```
[Category 1 - Horizontal Carousel]
  [Video Card] [Video Card] [Video Card] ...

[Category 2 - Horizontal Carousel]
  [Video Card] [Video Card] [Video Card] ...
```

**Video Card:**

| Element           | Description                                      |
|-------------------|--------------------------------------------------|
| Thumbnail         | Video cover image                                |
| Play overlay      | Play icon over the cover                         |
| Video preview     | Auto-preview after 2s hover (desktop only)       |
| Title             | Video name                                       |
| Description       | Descriptive text (truncated on mobile)           |
| Likes             | Counter + like button                            |
| Comments          | Counter + button to open modal                   |
| Trash (admin)     | Delete button (visible only for ROLE_ADMIN)      |

**Rules:**

**RL-HOME-01** - Videos are loaded via `VideoService.videos()` (reactive signal). The list updates automatically when the signal changes.

**RL-HOME-02** - Videos are grouped by `category.name` using the `agruparPor()` utility function.

**RL-HOME-03** - On desktop, hovering over a card for 2 seconds starts video preview playback (muted, looping).

**RL-HOME-04** - On mobile (< 768px), video preview is disabled.

**RL-HOME-05** - Clicking a card opens the full-screen video modal (`VideoZoomModalComponent`) via `ModalService`.

**RL-HOME-06** - Search query params (`tipo=video&id=xxx` or `q=term`) trigger auto-scroll to the matching item.

---

### 8.2 Video Deletion (Admin on public page)

**Description:** Administrators see a trash button on each video card.

**Flow:**

1. Admin clicks the trash icon on a video card
2. Confirmation modal opens: "Do you really want to delete the video '{title}'?"
3. Confirms → calls `VideoService.removeVideo(id)` → success toast → list updates automatically
4. Cancels → closes modal, nothing happens

**Endpoint called:** `DELETE /api/admin/videos/{id}`

**Rules:**

**RL-DEL-VID-01** - The trash button is only displayed when `isAdmin === true` (verified via `AuthService.user$`).

**RL-DEL-VID-02** - Clicking the trash uses `$event.stopPropagation()` to prevent opening the video modal.

---

### 8.3 Video Modal

**Component:** `VideoZoomModalComponent`

**Description:** Full-screen modal for watching videos, liking, and commenting.

**Features:**

| Feature              | Description                                       |
|----------------------|---------------------------------------------------|
| Video player         | Plays the selected video                          |
| Like                 | Toggle favorite via `VideoService.toggleFavorite()`|
| Comments             | Comment list with submission form                  |
| Delete comment (admin)| Trash icon on each comment (admin only)           |
| Close                | X button, ESC key, or browser back button          |

**Rules:**

**RL-MODAL-VID-01** - Opening the modal registers a view via `PATCH /api/videos/{id}/view`.

**RL-MODAL-VID-02** - Comments are loaded via `GET /api/comments/video/{videoId}`.

**RL-MODAL-VID-03** - New comments are submitted via `POST /api/comments`.

**RL-MODAL-VID-04** - Comment deletion (admin) via `DELETE /api/comments/{commentId}`.

**RL-MODAL-VID-05** - The modal uses `window.history.pushState()` to allow closing with the browser back button.

---

## 9. Menus Module (Meal Plans)

### 9.1 Menu Feed

**Component:** `MenusComponent`

**Route:** `/app/menus`

**Description:** Displays all menus grouped by category in horizontal carousels.

**Menu Card:**

| Element           | Description                                      |
|-------------------|--------------------------------------------------|
| Cover image       | Dish photo                                       |
| Title             | Menu name                                        |
| Category          | Category name (green tag)                        |
| Description       | Descriptive text (truncated to 2 lines)          |
| Likes             | Counter + like button                            |
| Comments          | Counter + button to open modal                   |
| Trash (admin)     | Delete button (visible only for ROLE_ADMIN)      |

**Rules:**

**RL-MENU-01** - Menus are loaded via `MenuService.menus()` (reactive signal).

**RL-MENU-02** - Grouped by `category.name` via `agruparPor()`.

**RL-MENU-03** - Clicking a card opens the menu modal (`MenuModalComponent`).

**RL-MENU-04** - Search query params work the same as Home.

---

### 9.2 Menu Deletion (Admin on public page)

**Flow:** Identical to video deletion (Section 8.2).

**Endpoint called:** `DELETE /api/admin/menus/{id}`

---

### 9.3 Menu Modal

**Component:** `MenuModalComponent`

**Description:** Modal with full menu details.

**Sections displayed:**

| Section                  | Description                              |
|--------------------------|------------------------------------------|
| Cover image              | Full-size dish photo                     |
| Title and description    | Name and full description                |
| Recipe                   | Recipe text (or "No recipe registered")  |
| Nutritionist Tips        | Tips (or "No tips registered")           |
| Nutritional Information  | Protein, carbs, fat, fiber, calories     |
| Comments                 | List with submission form                |
| Delete comment (admin)   | Trash icon on each comment (admin only)  |

**Inputs:**

| Input               | Type       | Description               |
|---------------------|------------|---------------------------|
| `menu`              | Menu       | Menu to display           |
| `comments`          | string[]   | Comment list              |
| `canDeleteComments` | boolean    | Enables delete button     |

**Outputs:**

| Output          | Type   | Description            |
|-----------------|--------|------------------------|
| `close`         | void   | Close modal            |
| `favorite`      | void   | Toggle favorite        |
| `comment`       | string | New comment            |
| `commentDelete` | string | Comment to delete      |

---

## 10. Favorites Module

**Component:** `FavoritesComponent`

**Route:** `/app/favorites`

**Description:** Displays videos and menus favorited by the user, grouped by category.

**Visual Structure:**

```
[Section: Favorite Videos]
  [Carousel by category]

[Section: Favorite Menus]
  [Carousel by category]
```

**Rules:**

**RL-FAV-01** - Favorites are loaded via `FavoritesService.load()` when entering the page.

**RL-FAV-02** - The list is filtered by crossing favorite IDs with full data from `VideoService` and `MenuService`.

**RL-FAV-03** - Unfavoriting an item removes it from the list in real time.

**Endpoints called:**

| Method               | Endpoint                           | Description          |
|----------------------|------------------------------------|----------------------|
| Load favorites       | `GET /api/favorites`               | List all favorites   |
| Toggle favorite      | `POST /api/favorites/{type}/{id}`  | Like/unlike          |

---

## 11. Most Viewed Module

**Component:** `MostViewedComponent`

**Route:** `/app/most-viewed`

**Description:** Displays videos sorted by view count (descending).

**Rules:**

**RL-VIEW-01** - Only videos with `views > 0` are displayed.

**RL-VIEW-02** - The list is reactively updated when the video signal changes.

---

## 12. Admin Module - Videos

### 12.1 Video Management

**Component:** `VideoAdminComponent`

**Route:** `/app/video-admin`

**Access:** `authGuard` + `adminGuard` (ROLE_ADMIN)

**Description:** Form for adding new videos and listing/deleting existing videos and categories.

**Form fields:**

| Field        | Type     | Required | Validation           |
|--------------|----------|----------|----------------------|
| title        | text     | Yes      | Minimum 3 characters |
| description  | textarea | Yes      | Minimum 5 characters |
| url          | file     | Yes      | Video file           |
| cover        | file     | No       | Image file           |
| categoryName | text     | Yes      | Category name        |
| recipe       | textarea | No       | -                    |
| protein      | number   | No       | Default: 0           |
| carbs        | number   | No       | Default: 0           |
| fat          | number   | No       | Default: 0           |
| fiber        | number   | No       | Default: 0           |
| calories     | number   | No       | Default: 0           |

**Upload Features:**

| Feature           | Description                                       |
|-------------------|---------------------------------------------------|
| Click to select   | Standard file input                               |
| Drag-and-drop     | Drag file to upload area                          |
| Visual feedback   | Area changes color on drag (`.drag-active`)       |
| File name display | Shows selected file name with check icon          |

**Rules:**

**RL-VADM-01** - The `categoryName` field accepts free text. The system looks up or creates the category automatically via `CategoriesService.ensureCategoryId()`.

**RL-VADM-02** - Category resolution flow:
1. Search in local list (normalized)
2. Search in fresh API list (`GET /api/categories?type=VIDEO`)
3. Create automatically (`POST /api/categories`)
4. If creation returns no ID, fetch list again

**RL-VADM-03** - After successful save, the form is cleared and a success notification is displayed.

**RL-VADM-04** - On error, an error notification is displayed.

**Endpoints called:**

| Action             | Endpoint                          |
|--------------------|-----------------------------------|
| List categories    | `GET /api/categories?type=VIDEO`  |
| Create category    | `POST /api/categories`            |
| Create video       | `POST /api/admin/videos`          |
| Delete video       | `DELETE /api/admin/videos/{id}`   |
| Delete category    | `DELETE /api/categories/{id}`     |

---

## 13. Admin Module - Menus

### 13.1 Menu Management

**Component:** `MenuAdminComponent`

**Route:** `/app/menu-admin`

**Access:** `authGuard` + `adminGuard` (ROLE_ADMIN)

**Description:** Form for adding new menus and listing/deleting existing menus and categories.

**Form fields:**

| Field            | Type     | Required | Validation           |
|------------------|----------|----------|----------------------|
| title            | text     | Yes      | Minimum 3 characters |
| description      | textarea | Yes      | Minimum 5 characters |
| categoryName     | text     | Yes      | Category name        |
| cover            | file     | No       | Image file           |
| recipe           | textarea | No       | -                    |
| nutritionistTips | textarea | No       | -                    |
| protein          | number   | No       | Default: 0           |
| carbs            | number   | No       | Default: 0           |
| fat              | number   | No       | Default: 0           |
| fiber            | number   | No       | Default: 0           |
| calories         | number   | No       | Default: 0           |

**Rules:** Identical to VideoAdminComponent (RL-VADM-01 to RL-VADM-04), adapted for type `MENU`.

**Endpoints called:**

| Action             | Endpoint                          |
|--------------------|-----------------------------------|
| List categories    | `GET /api/categories?type=MENU`   |
| Create category    | `POST /api/categories`            |
| Create menu        | `POST /api/admin/menus`           |
| Delete menu        | `DELETE /api/admin/menus/{id}`    |
| Delete category    | `DELETE /api/categories/{id}`     |

---

## 14. Shared Reusable Components

### 14.1 CategoryCarouselComponent

**Description:** Generic horizontal carousel that groups items by category.

| Input          | Type           | Description                          |
|----------------|----------------|--------------------------------------|
| `title`        | string         | Category title                       |
| `items`        | T[]            | List of items to display             |
| `itemTemplate` | TemplateRef    | Custom template for each item        |

**Rule:** Uses the `ng-template` + `*ngTemplateOutlet` pattern to render different cards (video or menu) with the same component.

---

### 14.2 EngagementSummaryComponent

**Description:** Displays like and comment counters with interactive buttons.

| Input           | Type    | Description            |
|-----------------|---------|------------------------|
| `likesCount`    | number  | Number of likes        |
| `commentsCount` | number  | Number of comments     |
| `liked`         | boolean | Whether user liked it  |

| Output          | Type | Description           |
|-----------------|------|-----------------------|
| `likeClick`     | void | User clicked like     |
| `commentsClick` | void | User clicked comments |

---

### 14.3 CommentsBoxComponent

**Description:** Comment box with list, submission form, and optional delete button.

| Input               | Type          | Description                       |
|---------------------|---------------|-----------------------------------|
| `comments`          | string[]      | Simple comment list               |
| `commentItems`      | CommentItem[] | Detailed list (id, text, author)  |
| `canDeleteComments` | boolean       | Shows trash on each comment       |
| `favorited`         | boolean       | Favorite button state             |

| Output          | Type   | Description            |
|-----------------|--------|------------------------|
| `favoriteClick` | void   | Toggle favorite        |
| `commentSubmit` | string | New comment text       |
| `commentDelete` | string | Comment ID to delete   |

---

### 14.4 ConfirmationModalComponent

**Description:** Generic confirmation modal reused throughout the application.

| Input        | Type    | Default                | Description              |
|--------------|---------|------------------------|--------------------------|
| `open`       | boolean | false                  | Controls visibility      |
| `title`      | string  | 'Atencao'              | Modal title              |
| `message`    | string  | 'Deseja continuar?'    | Confirmation message     |
| `confirmText`| string  | 'Confirmar'            | Confirm button text      |
| `cancelText` | string  | 'Cancelar'             | Cancel button text       |
| `isDanger`   | boolean | false                  | Red danger styling       |

| Output    | Type | Description       |
|-----------|------|-------------------|
| `confirm` | void | User confirmed    |
| `cancel`  | void | User cancelled    |

---

### 14.5 FavoriteButtonComponent

**Description:** Heart button for liking/unliking.

| Input      | Type    | Description        |
|------------|---------|---------------------|
| `favorited`| boolean | Favorite state      |

| Output  | Type | Description    |
|---------|------|----------------|
| `toggle`| void | Toggle clicked |

---

### 14.6 SearchFieldComponent

**Description:** Search field with autocomplete, suggestions, and categories.

| Input         | Type     | Description            |
|---------------|----------|------------------------|
| `placeholder` | string   | Placeholder text       |
| `value`       | string   | Current value          |
| `disabled`    | boolean  | Disabled state         |
| `categories`  | string[] | Categories for filter  |
| `suggestions` | string[] | Autocomplete suggestions|

| Output        | Type   | Description          |
|---------------|--------|----------------------|
| `valueChange` | string | Text changed         |
| `search`      | string | Search confirmed     |

---

### 14.7 FormFieldComponent (Custom Input)

**Description:** Custom input with mask, icons, and Reactive Forms integration (ControlValueAccessor).

| Input         | Type     | Description                          |
|---------------|----------|--------------------------------------|
| `label`       | string   | Field label                          |
| `placeholder` | string   | Placeholder                          |
| `type`        | string   | text, email, password, tel           |
| `icon`        | string   | Left-side icon                       |
| `error`       | string   | Error message                        |
| `maxlength`   | number   | Character limit                      |
| `showCounter` | boolean  | Show character counter               |
| `mask`        | MaskType | Mask type (cpf, phone, etc.)         |

**Supported Masks:**

| Type     | Format              | Example            |
|----------|---------------------|--------------------|
| cpf      | XXX.XXX.XXX-XX      | 123.456.789-00     |
| cnpj     | XX.XXX.XXX/XXXX-XX  | 12.345.678/0001-00 |
| phone    | (XX) XXXX-XXXX      | (11) 1234-5678     |
| mobile   | (XX) XXXXX-XXXX     | (11) 91234-5678    |
| zipcode  | XXXXX-XXX           | 12345-678          |
| rg       | XX.XXX.XXX-X        | 12.345.678-9       |
| date     | XX/XX/XXXX          | 31/12/2024         |

---

## 15. Shared Services

### 15.1 VideoService

**File:** `shared/services/video/video.service.ts`

**Exposed Signals:**

| Signal        | Type             | Description            |
|---------------|------------------|------------------------|
| `videos`      | Signal<Video[]>  | All videos list        |
| `totalVideos` | Computed<number> | Video count            |
| `totalLikes`  | Computed<number> | Total likes            |

**Endpoints:**

| Method           | Endpoint                       | Description          |
|------------------|--------------------------------|----------------------|
| `loadVideos()`   | `GET /api/videos`              | Load all videos      |
| `addVideo()`     | `POST /api/admin/videos`       | Create video (admin) |
| `removeVideo()`  | `DELETE /api/admin/videos/{id}`| Delete video (admin) |

---

### 15.2 MenuService

**File:** `shared/services/menus/menus-service.ts`

**Exposed Signals:**

| Signal        | Type             | Description            |
|---------------|------------------|------------------------|
| `menus`       | Signal<Menu[]>   | All menus list         |
| `totalMenus`  | Computed<number> | Menu count             |
| `totalLikes`  | Computed<number> | Total likes            |

**Endpoints:**

| Method          | Endpoint                       | Description          |
|-----------------|--------------------------------|----------------------|
| `loadMenus()`   | `GET /api/menus`              | Load all menus       |
| `addMenu()`     | `POST /api/admin/menus`       | Create menu (admin)  |
| `removeMenu()`  | `DELETE /api/admin/menus/{id}`| Delete menu (admin)  |

---

### 15.3 FavoritesService

**File:** `shared/services/favorites/favorites.service..ts`

**Exposed Signals:**

| Signal            | Type                    | Description          |
|-------------------|-------------------------|----------------------|
| `favorites`       | Signal<FavoriteDTO[]>   | All favorites        |
| `totalFavorites`  | Computed<number>        | Favorites count      |
| `videoFavorites`  | Computed<FavoriteDTO[]> | VIDEO type favorites |
| `menuFavorites`   | Computed<FavoriteDTO[]> | MENU type favorites  |

**Endpoints:**

| Method          | Endpoint                               | Description       |
|-----------------|----------------------------------------|-------------------|
| `load()`        | `GET /api/favorites`                   | Load all          |
| `loadByType()`  | `GET /api/favorites/{type}`            | Load by type      |
| `toggle()`      | `POST /api/favorites/{type}/{itemId}`  | Toggle favorite   |
| `getStatus()`   | `GET /api/favorites/{type}/{id}/status`| Check status      |

---

### 15.4 CommentsService

**File:** `shared/services/comments/comments.service.ts`

**Exposed Signals:**

| Signal          | Type                                       | Description          |
|-----------------|--------------------------------------------|----------------------|
| `comments`      | Signal<Record<string, CommentResponse[]>>  | Comments by video    |
| `totalComments` | Computed<number>                           | Total count          |

**Endpoints:**

| Method          | Endpoint                            | Description       |
|-----------------|-------------------------------------|-------------------|
| `loadByVideo()` | `GET /api/comments/video/{videoId}` | Load by video     |
| `add()`         | `POST /api/comments`                | Create comment    |
| `delete()`      | `DELETE /api/comments/{commentId}`  | Delete (admin)    |

---

### 15.5 CategoriesService

**File:** `shared/services/categories/categories.service.ts`

**Endpoints:**

| Method                | Endpoint                          | Description       |
|-----------------------|-----------------------------------|-------------------|
| `list(type)`          | `GET /api/categories?type={type}` | List by type      |
| `create(payload)`     | `POST /api/categories`            | Create category   |
| `delete(id)`          | `DELETE /api/categories/{id}`     | Delete category   |
| `ensureCategoryId()`  | Multiple (see RL-VADM-02)        | Find or create    |

---

### 15.6 ModalService

**File:** `shared/services/modal/modal.service.ts`

**Exposed Signals:**

| Signal          | Type                  | Description          |
|-----------------|-----------------------|----------------------|
| `selectedVideo` | Signal<Video \| null> | Selected video       |
| `isModalOpen`   | Computed<boolean>     | Modal is open        |

**Rule:** Opening the modal registers a view via `PATCH /api/videos/{id}/view`.

---

### 15.7 NotificationService (Toasts)

**File:** `shared/services/alert-message/alert-message.service.ts`

**Alert types:**

| Type    | Color  | Duration |
|---------|--------|----------|
| success | Green  | 2000ms   |
| error   | Red    | 4000ms   |
| warning | Yellow | 4000ms   |
| info    | Blue   | 4000ms   |

---

### 15.8 ContentNotificationsService

**File:** `shared/services/notifications/content-notifications.service.ts`

**Description:** Manages new content notifications (persisted in localStorage).

**Exposed Signals:**

| Signal          | Type                          | Description       |
|-----------------|-------------------------------|-------------------|
| `notifications` | Signal<ContentNotification[]> | All notifications |
| `unreadCount`   | Computed<number>              | Unread count      |

---

### 15.9 ViewHistoryService

**File:** `shared/services/view-history/view-history.service.ts`

**Description:** Tracks watched videos per user (persisted in localStorage).

**Storage key:** `vida-longa-flix:views:{email}`

**Methods:**

| Method                   | Description                          |
|--------------------------|--------------------------------------|
| `registerView()`         | Increment counter for a video        |
| `getViews()`             | Return complete user history         |
| `getMostWatchedVideos()` | Top videos by view count             |
| `clearHistory()`         | Clear user history                   |

---

## 16. Data Model

### Entity: Video

| Field       | Type              | Description              |
|-------------|-------------------|--------------------------|
| id          | string            | UUID                     |
| title       | string            | Title                    |
| description | string            | Description              |
| url         | string            | Video URL                |
| cover       | string            | Cover image URL          |
| category    | {id, name}        | Category                 |
| comments    | Comment[]         | Comment list             |
| commentCount| number            | Total comments           |
| views       | number            | View count               |
| watchTime   | number            | Watch time               |
| recipe      | string            | Recipe                   |
| protein     | number            | Protein (g)              |
| carbs       | number            | Carbohydrates (g)        |
| fat         | number            | Fat (g)                  |
| fiber       | number            | Fiber (g)                |
| calories    | number            | Calories (kcal)          |
| favorited   | boolean           | Favorited by user        |
| likesCount  | number            | Total likes              |

### Entity: Menu

| Field            | Type              | Description              |
|------------------|-------------------|--------------------------|
| id               | string            | UUID                     |
| title            | string            | Title                    |
| description      | string            | Description              |
| cover            | string            | Cover image URL          |
| category         | Category          | Category                 |
| recipe           | string            | Recipe                   |
| nutritionistTips | string            | Nutritionist tips        |
| protein          | number            | Protein (g)              |
| carbs            | number            | Carbohydrates (g)        |
| fat              | number            | Fat (g)                  |
| fiber            | number            | Fiber (g)                |
| calories         | number            | Calories (kcal)          |
| favorited        | boolean           | Favorited by user        |
| likesCount       | number            | Total likes              |

### Entity: Category

| Field | Type         | Description          |
|-------|--------------|----------------------|
| id    | string       | UUID                 |
| name  | string       | Category name        |
| type  | CategoryType | VIDEO or MENU        |

### Entity: User

| Field           | Type      | Description              |
|-----------------|-----------|--------------------------|
| id              | string    | UUID                     |
| name            | string    | Full name                |
| email           | string    | Email                    |
| taxId           | string    | CPF (Brazilian ID)       |
| phone           | string    | Phone number             |
| address         | Address   | Full address             |
| photo           | string    | Photo URL                |
| profileComplete | boolean   | Profile is complete      |
| roles           | string[]  | Roles (ROLE_USER, ROLE_ADMIN) |

### Entity: Comment

| Field | Type              | Description          |
|-------|-------------------|----------------------|
| id    | string            | UUID                 |
| text  | string            | Comment text         |
| date  | string            | ISO date             |
| user  | {id, name}        | Author               |

### Entity: ContentNotification

| Field     | Type                   | Description              |
|-----------|------------------------|--------------------------|
| id        | string                 | UUID                     |
| type      | 'VIDEO' \| 'MENU'     | Content type             |
| title     | string                 | Title                    |
| createdAt | number                 | Timestamp in milliseconds|
| read      | boolean                | Read status              |
| readAt    | number \| null         | When it was read         |

---

## 17. Consumed API Endpoints

### Authentication

| Method | Endpoint                           | Description              |
|--------|------------------------------------|--------------------------|
| POST   | `/api/auth/login`                  | Login                    |
| POST   | `/api/auth/register`               | Registration             |
| GET    | `/api/users/me`                    | Logged-in user data      |
| POST   | `/api/auth/password-recovery`      | Password recovery        |
| POST   | `/api/auth/password-change/notify` | Change confirmation      |

### Videos

| Method | Endpoint                       | Access  | Description          |
|--------|--------------------------------|---------|----------------------|
| GET    | `/api/videos`                  | Public  | List videos          |
| PATCH  | `/api/videos/{id}/view`        | Auth    | Register view        |
| POST   | `/api/admin/videos`            | Admin   | Create video         |
| DELETE | `/api/admin/videos/{id}`       | Admin   | Delete video         |

### Menus

| Method | Endpoint                       | Access  | Description          |
|--------|--------------------------------|---------|----------------------|
| GET    | `/api/menus`                   | Public  | List menus           |
| POST   | `/api/admin/menus`             | Admin   | Create menu          |
| DELETE | `/api/admin/menus/{id}`        | Admin   | Delete menu          |

### Categories

| Method | Endpoint                       | Access  | Description          |
|--------|--------------------------------|---------|----------------------|
| GET    | `/api/categories?type={type}`  | Public  | List categories      |
| POST   | `/api/categories`              | Admin   | Create category      |
| DELETE | `/api/categories/{id}`         | Admin   | Delete category      |

### Comments

| Method | Endpoint                            | Access  | Description          |
|--------|-------------------------------------|---------|----------------------|
| GET    | `/api/comments/video/{videoId}`     | Public  | List by video        |
| POST   | `/api/comments`                     | Auth    | Create comment       |
| DELETE | `/api/comments/{commentId}`         | Admin   | Delete comment       |

### Favorites

| Method | Endpoint                                | Access | Description       |
|--------|-----------------------------------------|--------|-------------------|
| GET    | `/api/favorites`                        | Auth   | List all          |
| GET    | `/api/favorites/{type}`                 | Auth   | List by type      |
| POST   | `/api/favorites/{type}/{itemId}`        | Auth   | Toggle favorite   |
| GET    | `/api/favorites/{type}/{itemId}/status` | Auth   | Favorite status   |

---

## 18. Local Storage

| Key                                | Type          | Description                    |
|------------------------------------|---------------|--------------------------------|
| `token`                            | string        | User JWT                       |
| `user`                             | JSON (User)   | User data                      |
| `vlflix:content-notifications:v1`  | JSON (array)  | Content notifications          |
| `vida-longa-flix:views:{email}`    | JSON (Record) | View history                   |

---

## 19. Tests

**Framework:** Vitest (via `@angular/build:unit-test`)

**Coverage:** 61 test files, 276 tests.

**Areas covered:**

| Area                    | Tests                                           |
|-------------------------|-------------------------------------------------|
| AuthService             | Session persistence, token handling              |
| Guards                  | authGuard, adminGuard                           |
| Interceptor             | Header addition, JWT validation                  |
| Services                | VideoService, MenuService, FavoritesService, etc|
| Components              | Rendering, interaction, forms                    |
| Validators              | Strong password, CPF format, phone               |
| Utilities               | Masks, grouping, normalization                   |

---

## 20. Build and Deploy

**Build:** `npx ng build` (output at `dist/organo/browser`)

**CI:** GitHub Actions (`.github/workflows/ci.yml`)
- Runs on push to `main` and `feat/*` branches
- Runs on PRs to `main`
- Steps: checkout, setup Node 20, npm ci, lint, build, test

**Deploy:** GitHub Actions (`.github/workflows/deploy-aws.yml`)
- Automatic deploy to AWS S3 + CloudFront
- Only on `main` branch
