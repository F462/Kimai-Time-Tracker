#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>
#import <WidgetKit/WidgetKit.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>
#import <UIKit/UIKit.h>

@interface WidgetBridge : NSObject <RCTBridgeModule>
@end

@interface SharedFolderStorage : NSObject <RCTBridgeModule, UIDocumentPickerDelegate>
@property(nonatomic, copy) RCTPromiseResolveBlock folderResolve;
@property(nonatomic, copy) RCTPromiseRejectBlock folderReject;
@end

@implementation SharedFolderStorage

RCT_EXPORT_MODULE(SharedFolderStorage)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

RCT_REMAP_METHOD(pickFolder,
                 pickFolderWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *presenter = RCTPresentedViewController();
    if (presenter == nil) {
      reject(@"E_NO_VIEW_CONTROLLER", @"No view controller is available to open the folder picker", nil);
      return;
    }
    if (self.folderResolve != nil) {
      reject(@"E_PICKER_ACTIVE", @"A folder picker is already open", nil);
      return;
    }

    self.folderResolve = resolve;
    self.folderReject = reject;
    UIDocumentPickerViewController *picker =
      [[UIDocumentPickerViewController alloc] initForOpeningContentTypes:@[UTTypeFolder] asCopy:NO];
    picker.delegate = self;
    [presenter presentViewController:picker animated:YES completion:nil];
  });
}

- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls
{
  NSURL *url = urls.firstObject;
  RCTPromiseResolveBlock resolve = self.folderResolve;
  RCTPromiseRejectBlock reject = self.folderReject;
  self.folderResolve = nil;
  self.folderReject = nil;
  if (url == nil || resolve == nil) return;

  BOOL accessed = [url startAccessingSecurityScopedResource];
  NSError *error = nil;
  NSData *bookmark = [url bookmarkDataWithOptions:0
                    includingResourceValuesForKeys:nil
                                     relativeToURL:nil
                                             error:&error];
  if (accessed) [url stopAccessingSecurityScopedResource];
  if (bookmark == nil) {
    if (reject != nil) reject(@"E_FOLDER_PERMISSION", @"Unable to retain access to the selected folder", error);
    return;
  }

  resolve(@{
    @"uri": [bookmark base64EncodedStringWithOptions:0],
    @"name": url.lastPathComponent ?: @"Shared folder",
  });
}

- (void)documentPickerWasCancelled:(UIDocumentPickerViewController *)controller
{
  RCTPromiseRejectBlock reject = self.folderReject;
  self.folderResolve = nil;
  self.folderReject = nil;
  if (reject != nil) reject(@"E_CANCELLED", @"Folder selection was cancelled", nil);
}

RCT_REMAP_METHOD(exists,
                 existsForFolder:(NSString *)folder
                 filename:(NSString *)filename
                 existsResolver:(RCTPromiseResolveBlock)resolve
                 existsRejecter:(RCTPromiseRejectBlock)reject)
{
  [self withFolder:folder resolve:resolve reject:reject operation:^id(NSURL *directoryURL, NSError **error) {
    return @([[NSFileManager defaultManager] fileExistsAtPath:[directoryURL URLByAppendingPathComponent:filename].path]);
  }];
}

RCT_REMAP_METHOD(readFile,
                 readFileForFolder:(NSString *)folder
                 filename:(NSString *)filename
                 readResolver:(RCTPromiseResolveBlock)resolve
                 readRejecter:(RCTPromiseRejectBlock)reject)
{
  [self withFolder:folder resolve:resolve reject:reject operation:^id(NSURL *directoryURL, NSError **error) {
    NSURL *fileURL = [directoryURL URLByAppendingPathComponent:filename];
    __block NSData *contents = nil;
    NSFileCoordinator *coordinator = [[NSFileCoordinator alloc] initWithFilePresenter:nil];
    [coordinator coordinateReadingItemAtURL:fileURL options:0 error:error byAccessor:^(NSURL *coordinatedURL) {
      contents = [NSData dataWithContentsOfURL:coordinatedURL options:0 error:error];
    }];
    if (contents == nil) return nil;
    return [[NSString alloc] initWithData:contents encoding:NSUTF8StringEncoding];
  }];
}

RCT_REMAP_METHOD(writeFile,
                 writeFileForFolder:(NSString *)folder
                 filename:(NSString *)filename
                 value:(NSString *)value
                 writeResolver:(RCTPromiseResolveBlock)resolve
                 writeRejecter:(RCTPromiseRejectBlock)reject)
{
  [self withFolder:folder resolve:resolve reject:reject operation:^id(NSURL *directoryURL, NSError **error) {
    NSURL *fileURL = [directoryURL URLByAppendingPathComponent:filename];
    NSData *contents = [value dataUsingEncoding:NSUTF8StringEncoding];
    NSFileCoordinator *coordinator = [[NSFileCoordinator alloc] initWithFilePresenter:nil];
    [coordinator coordinateWritingItemAtURL:fileURL options:NSFileCoordinatorWritingForReplacing error:error byAccessor:^(NSURL *coordinatedURL) {
      [contents writeToURL:coordinatedURL options:NSDataWritingAtomic error:error];
    }];
    return *error == nil ? @YES : nil;
  }];
}

RCT_REMAP_METHOD(deleteFile,
                 deleteFileForFolder:(NSString *)folder
                 filename:(NSString *)filename
                 deleteResolver:(RCTPromiseResolveBlock)resolve
                 deleteRejecter:(RCTPromiseRejectBlock)reject)
{
  [self withFolder:folder resolve:resolve reject:reject operation:^id(NSURL *directoryURL, NSError **error) {
    NSURL *fileURL = [directoryURL URLByAppendingPathComponent:filename];
    NSFileCoordinator *coordinator = [[NSFileCoordinator alloc] initWithFilePresenter:nil];
    [coordinator coordinateWritingItemAtURL:fileURL options:NSFileCoordinatorWritingForDeleting error:error byAccessor:^(NSURL *coordinatedURL) {
      if ([[NSFileManager defaultManager] fileExistsAtPath:coordinatedURL.path]) {
        [[NSFileManager defaultManager] removeItemAtURL:coordinatedURL error:error];
      }
    }];
    return *error == nil ? @YES : nil;
  }];
}

- (void)withFolder:(NSString *)identifier
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
         operation:(id (^)(NSURL *directoryURL, NSError **error))operation
{
  NSData *bookmark = [[NSData alloc] initWithBase64EncodedString:identifier options:0];
  if (bookmark == nil) {
    reject(@"E_FOLDER_PERMISSION", @"The selected folder bookmark is invalid", nil);
    return;
  }
  BOOL stale = NO;
  NSError *error = nil;
  NSURL *url = [NSURL URLByResolvingBookmarkData:bookmark
                                         options:0
                                   relativeToURL:nil
                             bookmarkDataIsStale:&stale
                                           error:&error];
  if (url == nil || stale) {
    reject(@"E_FOLDER_PERMISSION", @"Access to the selected folder has expired. Select it again.", error);
    return;
  }

  BOOL accessed = [url startAccessingSecurityScopedResource];
  id result = operation(url, &error);
  if (accessed) [url stopAccessingSecurityScopedResource];
  if (error != nil) {
    reject(@"E_FOLDER_IO", @"Unable to access the selected folder", error);
  } else if (result == nil) {
    reject(@"E_FOLDER_IO", @"The selected folder operation failed", nil);
  } else {
    resolve(result);
  }
}

@end

@implementation WidgetBridge

RCT_EXPORT_MODULE(WidgetBridge)

RCT_EXPORT_METHOD(publishState:(NSDictionary *)state)
{
  NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.com.github.f462.kimaitimetracker"];
  [defaults setObject:state forKey:@"timesheetWidgetState"];
  [defaults synchronize];
  if (@available(iOS 14.0, *)) {
    [WidgetCenter.sharedWidgetCenter reloadAllTimelines];
  }
}

@end