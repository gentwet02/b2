import { Outlet } from '@tanstack/react-router';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';

/** Every page: the header, the route's page, the footer. */
export default function RootLayout() {
    return (
        <>
            <Header />
            <div className='site-main'>
                <Outlet />
            </div>
            <Footer />
        </>
    );
}
