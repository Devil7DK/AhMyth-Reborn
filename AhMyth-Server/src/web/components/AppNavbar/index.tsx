import './styles.scss';

import {
    Button,
    CompoundButton,
    Divider,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    Switch,
    typographyStyles,
} from '@fluentui/react-components';
import { Dismiss24Regular, Navigation24Regular } from '@fluentui/react-icons';
import { faAndroid } from '@fortawesome/free-brands-svg-icons';
import { faEye, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import Banner from '../../assets/images/banner.png';
import { useStore } from '../../store';
import { useIsMobile } from '../../utils/CustomHooks';

const links = [
    {
        group: 'Victims',
        links: [
            {
                title: 'Victims Live',
                subtitle: 'View Victim Devices Live',
                icon: <FontAwesomeIcon icon={faEye} />,
                url: '/victims/live',
            },
        ],
    },
    {
        group: 'Payload',
        links: [
            {
                title: 'Generate APK',
                subtitle: 'Build/Patch APK for Android',
                icon: <FontAwesomeIcon icon={faAndroid} />,
                url: '/payload',
            },
        ],
    },
];

const ThemeSwitch: React.FC = observer(() => {
    const { themeStore } = useStore();

    return (
        <div className='navbar-item theme-switch'>
            <FontAwesomeIcon
                icon={faSun}
                className={themeStore.theme === 'light' ? 'active' : ''}
            />
            <Switch
                checked={themeStore.theme === 'dark'}
                onChange={() => {
                    themeStore.toggleTheme();
                }}
            />
            <FontAwesomeIcon
                icon={faMoon}
                className={themeStore.theme === 'dark' ? 'active' : ''}
            />
        </div>
    );
});

export const AppNavbar: React.FC = observer(() => {
    const isMobile = useIsMobile();

    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Drawer
                className='nav-drawer'
                type={isMobile ? 'overlay' : 'inline'}
                separator
                position='start'
                open={isOpen || !isMobile}
                onOpenChange={(_, { open }) => {
                    setIsOpen(open);
                }}
            >
                <DrawerHeader>
                    <DrawerHeaderTitle
                        action={
                            isMobile ? (
                                <Button
                                    appearance='transparent'
                                    aria-label='Close'
                                    icon={<Dismiss24Regular />}
                                    onClick={() => {
                                        setIsOpen(false);
                                    }}
                                />
                            ) : null
                        }
                    >
                        <img alt='AhMyth' src={Banner}></img>
                    </DrawerHeaderTitle>
                </DrawerHeader>

                <DrawerBody>
                    {links.map((linkGroup, groupIndex) => (
                        <React.Fragment key={groupIndex}>
                            <Divider>{linkGroup.group}</Divider>
                            {linkGroup.links.map((link, linkIndex) => (
                                <CompoundButton
                                    key={`${groupIndex}-${linkIndex}`}
                                    icon={link.icon}
                                    secondaryContent={link.subtitle}
                                    appearance={
                                        location.pathname === link.url
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                    onClick={() => {
                                        navigate(link.url);

                                        if (isMobile) {
                                            setIsOpen(false);
                                        }
                                    }}
                                >
                                    {link.title}
                                </CompoundButton>
                            ))}
                        </React.Fragment>
                    ))}
                    <div className='fill'></div>
                    {!isMobile && <ThemeSwitch />}
                </DrawerBody>
            </Drawer>
            <div className='main-app-container'>
                {isMobile ? (
                    <div className='navbar'>
                        <div className='navbar-item drawer-toggle'>
                            <Button
                                appearance='transparent'
                                icon={<Navigation24Regular />}
                                onClick={() => {
                                    setIsOpen(true);
                                }}
                            />
                        </div>
                        <div
                            className='navbar-item title'
                            style={typographyStyles.title3}
                        >
                            AhMyth
                        </div>
                        <div className='fill'></div>
                        <ThemeSwitch />
                    </div>
                ) : null}
                <div className='main-scroll-container'>
                    <Outlet />
                </div>
            </div>
        </>
    );
});
