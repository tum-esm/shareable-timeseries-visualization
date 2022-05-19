import React from 'react';

const NotFoundPage = () => {
    return (
        <main className="w-screen h-screen flex-col-center gap-y-1">
            <h1 className="text-2xl">404: Page not found</h1>
            <a href="/" target="_self" className="text-blue-500 underline">
                go back to main page
            </a>
        </main>
    );
};

export default NotFoundPage;
