# How to Run the Frontend

## Prerequisites
It appears that **Node.js** is not installed on your system. You must install it to run the frontend.

1.  **Download Node.js**: Go to [nodejs.org](https://nodejs.org/) and download the LTS version (Long Term Support).
2.  **Install**: Run the installer and follow the prompts. Ensure "Add to PATH" is selected.
3.  **Verify Installation**: Open a new terminal and run:
    ```bash
    node -v
    npm -v
    ```
    **Note**: You may need to restart your terminal or IDE (VS Code) for the changes to take effect.

## Running the Project

Once Node.js is installed, follow these steps:

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    This project uses `pnpm` (indicated by `pnpm-lock.yaml`), but you can use `npm` if you prefer.
    
    If you want to use `pnpm` (recommended):
    ```bash
    npm install -g pnpm
    pnpm install
    ```
    
    Or using `npm`:
    ```bash
    npm install
    ```

3.  **Start the Development Server**:
    ```bash
    npm run dev
    # or
    pnpm dev
    ```

4.  **Open in Browser**:
    Open [http://localhost:3000](http://localhost:3000) to view the application.

## Troubleshooting
-   If you see strict mode errors, check `next.config.mjs`.
-   If dependency conflicts occur, try deleting `node_modules` and running `npm install` again.

## Common Errors

### "Script disabled" or "cannot be loaded because running scripts is disabled on this system" (Windows)

This is a PowerShell security feature. To fix it:

1.  Open your **VS Code terminal** or **PowerShell**.
2.  Run the following command to allow local scripts to run for your user:
    ```powershell
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
    ```
3.  Try running `npm run dev` again.
