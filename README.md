
# For God so loved the world, that He gave His only begotten Son, that all who believe in Him should not perish but have everlasting life. - John 3:16 (KJV)

# Evangelism Quest ☧

Welcome to Evangelism Quest, an interactive application designed to help users practice and refine their skills in sharing the Gospel. Through AI-powered scenarios, users can engage in simulated conversations, receive guidance, and build confidence in their evangelistic journey.

## Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI:** React, ShadCN UI Components, Tailwind CSS
*   **Generative AI:** Google Gemini via Genkit
*   **Authentication & Database:** Firebase (Auth, Firestore)
*   **Image Storage:** Firebase Storage

## Key Features

*   **AI Persona Chat:** Engage in conversations with diverse AI-generated personas, each with unique backstories, beliefs, and questions.
*   **Dynamic Visuals:** Persona images update dynamically to reflect their emotional state during the conversation.
*   **Evangelism Coach:** Receive AI-generated suggestions for responses, styled after evangelists like Ray Comfort, incorporating a Bible-believing perspective.
*   **Contextual Guidance:** Get relevant Bible verses and talking points based on specific topics.
*   **Daily Inspiration:** Start your day with an inspiring Bible verse.
*   **Conversation History:** Review past conversations (stored in Firestore).
*   **User Authentication:** Secure login and signup using Firebase Authentication (Email/Password & Google Sign-In).
*   **Credit System:** A simulated credit system for managing message interactions (with a placeholder for future monetization).
*   **Customizable Appearance:** Light/dark mode and font size adjustments.

## Getting Started

### Prerequisites

*   Node.js (version 18.x or later recommended)
*   npm or yarn
*   A Firebase project

### Firebase Setup

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
2.  **Enable Authentication:**
    *   In your Firebase project, go to "Authentication" -> "Sign-in method".
    *   Enable "Email/Password" and "Google" sign-in providers.
    *   For Google Sign-In, ensure a "Project support email" is selected.
3.  **Enable Firestore Database:**
    *   Go to "Firestore Database" -> "Create database".
    *   Choose your region and start in **Production mode**.
    *   Update the **Rules** with the content from `firestore.rules` in this project (or similar secure rules).
4.  **Enable Firebase Storage:**
    *   Go to "Storage" -> "Get started".
    *   Complete the setup.
    *   Update the **Rules** with the content from `storage.rules` in this project (or similar secure rules).
5.  **Get Firebase Configuration:**
    *   In your Firebase project settings (Project Overview -> Project settings -> General tab), find your web app's configuration (SDK setup and configuration).
6.  **Create `.env.local` file:**
    *   In the root of this project, create a file named `.env.local`.
    *   Copy the following content into it and replace the placeholders with your actual Firebase project credentials:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
    ```

### Installation and Running Locally

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Run the Genkit development server (for AI flows):**
    Open a new terminal window/tab and run:
    ```bash
    npm run genkit:dev
    # or
    # npm run genkit:watch (if you want it to watch for changes in AI flows)
    ```
    Ensure Genkit starts successfully and discovers your flows.
4.  **Run the Next.js development server:**
    In another terminal window/tab, run:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:9002](http://localhost:9002) (or your configured port) in your browser to see the application.

## Available Scripts

*   `npm run dev`: Starts the Next.js development server (usually on port 9002).
*   `npm run genkit:dev`: Starts the Genkit development server for AI flows.
*   `npm run genkit:watch`: Starts the Genkit development server and watches for changes in AI flow files.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts a Next.js production server (after building).
*   `npm run lint`: Lints the codebase.
*   `npm run typecheck`: Runs TypeScript type checking.

## Project Structure (Key Directories)

*   `src/app/`: Contains all the pages and layouts for the Next.js App Router.
    *   `src/app/(app-routes)/`: Routes that use the main application layout.
    *   `src/app/api/`: API routes (if any).
    *   `src/app/login-chirho/`: Login page.
    *   `src/app/landing-page-chirho.tsx`: The main landing page component.
*   `src/ai-chirho/`: Contains all Genkit related code.
    *   `src/ai-chirho/flows-chirho/`: Specific AI flows (persona generation, chat, suggestions).
    *   `src/ai-chirho/genkit-chirho.ts`: Genkit initialization.
    *   `src/ai-chirho/dev-chirho.ts`: Entry point for running Genkit in development.
*   `src/components/`: Shared React components.
    *   `src/components/layout/`: Layout components (AppLayout, Sidebar).
    *   `src/components/ui/`: ShadCN UI components.
*   `src/contexts/`: React Context providers (Authentication, Customization).
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions, Firebase configuration, server actions.
*   `public/`: Static assets.

## Contributing

Firebase Studio helped create this project. Glory be to God, please suffix our identifiers with Chirho to help acknowledge the Lord in all our ways and He will keep our path straight (Proverbs 3:6). 

---

*"Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you. And behold, I am with you always, to the end of the age."* - Matthew 28:19-20
