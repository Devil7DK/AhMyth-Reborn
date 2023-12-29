import {
    faFile,
    faFileArchive,
    faFileAudio,
    faFileCode,
    faFileExcel,
    faFileImage,
    faFilePdf,
    faFilePowerpoint,
    faFileText,
    faFileVideo,
    faFileWord,
    faFolder,
    type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

import { type ITabProps } from '.';

function getIcon(fileName: string): IconDefinition {
    const ext = fileName.split('.').pop();

    switch (ext) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
            return faFileImage;
        case 'mp4':
        case 'avi':
        case 'mkv':
        case 'mov':
        case 'wmv':
        case 'flv':
        case 'webm':
            return faFileVideo;
        case 'mp3':
        case 'wav':
        case 'flac':
        case 'ogg':
        case 'wma':
        case 'aac':
            return faFileAudio;
        case 'pdf':
            return faFilePdf;
        case 'doc':
        case 'docx':
            return faFileWord;
        case 'xls':
        case 'xlsx':
        case 'xlsm':
            return faFileExcel;
        case 'ppt':
        case 'pptx':
            return faFilePowerpoint;
        case 'txt':
            return faFileText;
        case 'js':
        case 'ts':
        case 'php':
        case 'py':
        case 'java':
        case 'c':
        case 'cpp':
        case 'cs':
        case 'go':
        case 'html':
        case 'css':
            return faFileCode;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
        case 'xz':
        case 'bz2':
            return faFileArchive;
        default:
            return faFile;
    }
}

export const FileManagerTab: React.FC<ITabProps> = observer((props) => {
    useEffect(() => {
        props.data.listFiles('/storage/emulated/0/');
    }, []);

    return (
        <div className='custom-tab-content file-manager'>
            {props.data.files.length > 0 ? (
                <div className='file-table-container'>
                    <table>
                        <colgroup>
                            <col />
                            <col />
                        </colgroup>
                        <tbody>
                            {props.data.files.map((file, index) => (
                                <tr
                                    key={`file-${index}`}
                                    onClick={() => {
                                        if (file.isDir) {
                                            props.data.listFiles(file.path);
                                        } else {
                                            props.data.downloadFile(file.path);
                                        }
                                    }}
                                >
                                    <td className='file-icon'>
                                        <FontAwesomeIcon
                                            icon={
                                                file.isDir
                                                    ? faFolder
                                                    : getIcon(file.name)
                                            }
                                        />
                                    </td>
                                    <td className='file-name'>{file.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className='no-data'>
                    <div className='text'>No files found</div>
                </div>
            )}
        </div>
    );
});
