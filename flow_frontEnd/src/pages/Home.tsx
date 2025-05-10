import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import react , {useState} from 'react';
import Navigation from '@/components/Navigation';

const Home = ({ bookmarksView = false }) => {
    return (
        <div className="min-h-screen">
           <Navigation showBookmarks={bookmarksView}/>
        </div>
    )
}

export default Home;