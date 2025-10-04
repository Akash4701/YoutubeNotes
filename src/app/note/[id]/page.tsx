'use client'
import { useAuth } from '@/lib/context/AuthContext';
import { useQuery } from '@apollo/client/react';
import { useRef } from 'react';
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
import { MessageCircle } from 'lucide-react';
import Comments from '@/components/comments'; // Adjust path as needed
import { Button } from '@/components/ui/button';

type NoteData = {
    getNoteById: {
        title: string;
        pdf_url: string;
    } | null;
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const token = useAuth();
    const commentsRef = useRef<HTMLDivElement>(null);
    
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

    const scrollToComments = () => {
        commentsRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    };

    // ✅ Custom toolbar with Comments button
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        renderToolbar: (Toolbar) => (
            <Toolbar>
                {(slots) => {
                    const {
                        CurrentPageInput,
                        
                        EnterFullScreen,
                        GoToNextPage,
                        GoToPreviousPage,
                        NumberOfPages,
                      
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
                                {/* Comments button */}
                                <Button
                                    onClick={scrollToComments}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '8px 12px',
                                        background: 'transparent',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#374151',
                                        transition: 'all 0.2s ease',
                                        marginLeft: '8px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f3f4f6';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                    title="Go to Comments"
                                >
                                    <MessageCircle size={16} />
                                    <span>Comments</span>
                                </Button>
                                {/* ⛔ Download and Print removed */}
                            </div>
                        </>
                    );
                }}
            </Toolbar>
        ),
    });

    return (
        <div>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <div style={{ height: '100vh' }}>
                    {loading && <div>Loading PDF...</div>}
                    {error && <div>Error loading PDF</div>}
                    {data && data.getNoteById ? (
                        <Viewer
                            fileUrl={data.getNoteById.pdf_url}
                            onPageChange={handlePageChange}
                            initialPage={initialPage}
                            plugins={[defaultLayoutPluginInstance]} // ✅ Custom toolbar with Comments button
                        />
                    ) : null}
                </div>
            </Worker>
            
            {/* Comments Section */}
            <div ref={commentsRef}>
                <Comments noteId={id}/>
            </div>
        </div>
    );
}