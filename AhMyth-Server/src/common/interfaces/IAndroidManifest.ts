export interface IAndroidManifest {
    manifest: IManifest;
}

export interface IManifest {
    $: IAndroidManifestRootAttributes;
    'uses-permission': IUsesPermission[];
    'uses-feature': IUsesFeature[];
    'uses-sdk': IUsesSdk[];
    application: IApplication[];
    instrumentation: IInstrumentation[];
}

export interface IAndroidManifestRootAttributes {
    'xmlns:android': string;
    package: string;
    'android:installLocation': string;
}

export interface IUsesPermission {
    $: IUsesPermissionAttributes;
}

export interface IUsesPermissionAttributes {
    'android:name': string;
}

export interface IUsesFeature {
    $: IUsesFeatureAttributes;
}

export interface IUsesFeatureAttributes {
    'android:name': string;
    'android:required'?: string;
}

export interface IUsesSdk {
    $: IUsesSdkAttributes;
}

export interface IUsesSdkAttributes {
    'android:minSdkVersion': string;
    'android:targetSdkVersion': string;
}

export interface IApplication {
    $: IApplicationRootAttributes;
    'uses-library': IUsesLibrary[];
    activity: IActivity[];
    provider: IProvider[];
    service: IAndroidManifestService[];
    receiver: IReceiver[];
    'activity-alias': IAlias[];
}

export interface IApplicationRootAttributes {
    'android:name': string;
    'android:label': string;
    'android:icon': string;
    'android:hardwareAccelerated': string;
    'android:supportsRtl': string;
    'android:enableOnBackInvokedCallback': string;
    'android:theme': string;
}

export interface IUsesLibrary {
    $: IUsesLibraryAttributes;
}

export interface IUsesLibraryAttributes {
    'android:name': string;
    'android:required': string;
}

export interface IActivity {
    $: IActivityRootAttributes;
    'intent-filter'?: IActivityIntentFilter[];
    'meta-data'?: IActivityMetadata[];
}

export interface IActivityRootAttributes {
    'android:name': string;
    'android:label'?: string;
    'android:theme'?: string;
    'android:enabled'?: string;
    'android:windowSoftInputMode'?: string;
    'android:taskAffinity'?: string;
    'android:rotationAnimation'?: string;
    'android:resizeableActivity'?: string;
    'android:supportsPictureInPicture'?: string;
    'android:configChanges'?: string;
    'android:maxAspectRatio'?: string;
    'android:launchMode'?: string;
    'android:excludeFromRecents'?: string;
    'android:noHistory'?: string;
    'android:logo'?: string;
    'android:parentActivityName'?: string;
    'android:screenOrientation'?: string;
    'android:hardwareAccelerated'?: string;
    'android:uiOptions'?: string;
}

export interface IActivityIntentFilter {
    action?: IAction[];
    category?: ICategory[];
    data?: IActivityIntentFilterData[];
}

export interface IAction {
    $: IActionAttributes;
}

export interface IActionAttributes {
    'android:name': string;
    'android:exported'?: string;
}

export interface ICategory {
    $: ICategoryAttributes;
}

export interface ICategoryAttributes {
    'android:name': string;
}

export interface IActivityIntentFilterData {
    $: IIntentFilterDataAttributes;
}

export interface IIntentFilterDataAttributes {
    'android:mimeType'?: string;
    'android:scheme'?: string;
}

export interface IActivityMetadata {
    $: IActivityMetadataAttributes;
}

export interface IActivityMetadataAttributes {
    'android:name': string;
    'android:resource'?: string;
    'android:value'?: string;
}

export interface IProvider {
    $: IProviderAttributes;
    'meta-data'?: IProviderMetadata[];
}

export interface IProviderAttributes {
    'android:name': string;
    'android:authorities': string;
    'android:enabled'?: string;
    'android:exported'?: string;
    'android:grantUriPermissions'?: string;
}

export interface IProviderMetadata {
    $: IProviderMetadataAttributes;
}

export interface IProviderMetadataAttributes {
    'android:name': string;
    'android:resource': string;
}

export interface IAndroidManifestService {
    $: IAndroidManifestServiceAttributes;
    'intent-filter'?: IAndroidManifestServiceIntentFilter[];
    'meta-data'?: IAndroidManifestServiceMetadata[];
}

export interface IAndroidManifestServiceAttributes {
    'android:name': string;
    'android:stopWithTask'?: string;
    'android:process'?: string;
    'android:permission'?: string;
    'android:isolatedProcess'?: string;
    'android:enabled'?: string;
    'android:label'?: string;
    'android:exported'?: string;
}

export interface IAndroidManifestServiceIntentFilter {
    action: IAndroidManifestServiceIntentFilterAction[];
    category?: IAndroidManifestServiceIntentFilterCategory[];
    data?: IAndroidManifestServiceIntentFilterData[];
}

export interface IAndroidManifestServiceIntentFilterAction {
    $: IAndroidManifestServiceIntentFilterActionAttributes;
}

export interface IAndroidManifestServiceIntentFilterActionAttributes {
    'android:name': string;
}

export interface IAndroidManifestServiceIntentFilterCategory {
    $: IAndroidManifestServiceIntentFilterCategoryAttributes;
}

export interface IAndroidManifestServiceIntentFilterCategoryAttributes {
    'android:name': string;
}

export interface IAndroidManifestServiceIntentFilterData {
    $: IAndroidManifestServiceIntentFilterDataAttributes;
}

export interface IAndroidManifestServiceIntentFilterDataAttributes {
    'android:scheme': string;
}

export interface IAndroidManifestServiceMetadata {
    $: IAndroidManifestServiceMetadataAttributes;
}

export interface IAndroidManifestServiceMetadataAttributes {
    'android:name': string;
    'android:resource': string;
}

export interface IReceiver {
    $: IReceiverAttributes;
    'meta-data'?: IReceiverMetadata[];
    'intent-filter'?: IReceiverIntentFilter | IReceiverIntentFilter[];
}

export interface IReceiverAttributes {
    'android:name': string;
    'android:process'?: string;
    'android:exported'?: string;
    'android:label'?: string;
    'android:description'?: string;
    'android:permission'?: string;
    'android:enabled'?: string;
}

export interface IReceiverMetadata {
    $: IReceiverMetadataAttributes;
}

export interface IReceiverMetadataAttributes {
    'android:name': string;
    'android:resource': string;
}

export interface IReceiverIntentFilter {
    action: IReceiverIntentFilterAction | IReceiverIntentFilterAction[];
    data?: IReceiverIntentFilterData[];
}

export interface IReceiverIntentFilterAction {
    $: IReceiverIntentFilterActionAttributes;
}

export interface IReceiverIntentFilterActionAttributes {
    'android:name': string;
}

export interface IReceiverIntentFilterData {
    $: IReceiverIntentFilterDataAttributes;
}

export interface IReceiverIntentFilterDataAttributes {
    'android:mimeType'?: string;
    'android:scheme'?: string;
    'android:ssp'?: string;
}

export interface IAlias {
    $: IAliasAttributes;
    'intent-filter': IAliasIntentFilter[];
}

export interface IAliasAttributes {
    'android:name': string;
    'android:targetActivity': string;
    'android:label': string;
}

export interface IAliasIntentFilter {
    action: IAliasIntentFilterAction[];
    category: IAliasIntentFilterCategory[];
}

export interface IAliasIntentFilterAction {
    $: IAliasIntentFilterActionAttributes;
}

export interface IAliasIntentFilterActionAttributes {
    'android:name': string;
}

export interface IAliasIntentFilterCategory {
    $: IAliasIntentFilterCategoryAttributes;
}

export interface IAliasIntentFilterCategoryAttributes {
    'android:name': string;
}

export interface IInstrumentation {
    $: IInstrumentationAttribtues;
}

export interface IInstrumentationAttribtues {
    'android:name': string;
    'android:targetPackage': string;
    'android:label': string;
}
