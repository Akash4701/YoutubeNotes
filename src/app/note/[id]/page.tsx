'use client'
import { useAuth } from '@/lib/context/AuthContext';
import { useQuery } from '@apollo/client/react';
import {
    Viewer,
    Worker,
    PageChangeEvent
} from '@react-pdf-viewer/core';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';

// Import the default layout plugin
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import gql from 'graphql-tag';
import { use } from 'react';

type NoteData = {
    getNoteById: {
        title: string;
        pdf_url: string;
    } | null;
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const token = useAuth();
    console.log('noteId', id);

    const FETCH_NOTES_BY_ID = gql`
        query getNoteById($id: ID!) {
            getNoteById(id: $id) {
                title
                pdf_url
            }
        }
    `;

    const { data, loading, error } = useQuery<NoteData>(FETCH_NOTES_BY_ID, {
        variables: { id },
        skip: !token || !id,
    });

    // --- Load last visited page for this specific note ---
    const initialPage =
        typeof window !== 'undefined' &&
        localStorage.getItem(`current-page-${id}`)
            ? parseInt(localStorage.getItem(`current-page-${id}`)!, 10)
            : 0;

    const handlePageChange = (e: PageChangeEvent) => {
        localStorage.setItem(`current-page-${id}`, `${e.currentPage}`);
    };

    // ✅ Custom toolbar without Download/Print
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        renderToolbar: (Toolbar) => (
            <Toolbar>
                {(slots) => {
                    const {
                        CurrentPageInput,
                        Download,   // ❌ we will NOT use
                        EnterFullScreen,
                        GoToNextPage,
                        GoToPreviousPage,
                        NumberOfPages,
                        Open,       // ❌ optional: remove open file button
                        Print,      // ❌ we will NOT use
                        ShowSearchPopover,
                        Zoom,
                        ZoomIn,
                        ZoomOut,
                        SwitchTheme,
                    } = slots;

                    return (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <GoToPreviousPage />
                                <CurrentPageInput /> / <NumberOfPages />
                                <GoToNextPage />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <ZoomOut />
                                <Zoom />
                                <ZoomIn />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <ShowSearchPopover />
                                <EnterFullScreen />
                                <SwitchTheme />
                                {/* ⛔ Download and Print removed */}
                            </div>
                        </>
                    );
                }}
            </Toolbar>
        ),
    });

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <div style={{ height: '100vh' }}>
                {loading && <div>Loading PDF...</div>}
                {error && <div>Error loading PDF</div>}
                {data && data.getNoteById ? (
                    <Viewer
                        fileUrl={data.getNoteById.pdf_url}
                        onPageChange={handlePageChange}
                        initialPage={initialPage}
                        plugins={[defaultLayoutPluginInstance]} // ✅ Custom toolbar applied
                    />
                ) : null}
            </div>
        </Worker>
    );
}
