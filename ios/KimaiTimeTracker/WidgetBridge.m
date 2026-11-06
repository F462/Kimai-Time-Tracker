#import <React/RCTBridgeModule.h>
#import <WidgetKit/WidgetKit.h>
#import <UIKit/UIKit.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

@interface WidgetBridge : NSObject <RCTBridgeModule, UIDocumentPickerDelegate>
@property (nonatomic, copy) RCTPromiseResolveBlock folderResolve;
@property (nonatomic, copy) RCTPromiseRejectBlock folderReject;
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

RCT_REMAP_METHOD(getBackupFolder,
                 getBackupFolderWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSData *bookmark = [[NSUserDefaults standardUserDefaults] dataForKey:@"backupFolderBookmark"];
  if (bookmark == nil) {
    resolve([NSNull null]);
    return;
  }

  BOOL isStale = NO;
  NSError *error = nil;
  NSURL *folderURL = [NSURL URLByResolvingBookmarkData:bookmark options:0 relativeToURL:nil bookmarkDataIsStale:&isStale error:&error];
  if (folderURL == nil || error != nil || isStale) {
    resolve([NSNull null]);
    return;
  }
  resolve(@YES);
}

RCT_REMAP_METHOD(chooseBackupFolder,
                 chooseBackupFolderWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self.folderResolve != nil) {
      reject(@"E_BACKUP_IN_PROGRESS", @"A backup operation is already in progress", nil);
      return;
    }

    self.folderResolve = resolve;
    self.folderReject = reject;
    UIDocumentPickerViewController *picker = [[UIDocumentPickerViewController alloc] initForOpeningContentTypes:@[UTType.folder] asCopy:NO];
    picker.delegate = self;
    UIWindow *keyWindow = nil;
    for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
      if (![scene isKindOfClass:[UIWindowScene class]] || scene.activationState != UISceneActivationStateForegroundActive) {
        continue;
      }
      for (UIWindow *window in ((UIWindowScene *)scene).windows) {
        if (window.isKeyWindow) {
          keyWindow = window;
          break;
        }
      }
    }
    UIViewController *presenter = keyWindow.rootViewController;
    if (presenter == nil) {
      self.folderResolve = nil;
      self.folderReject = nil;
      reject(@"E_BACKUP_PICKER", @"Could not open the backup destination picker", nil);
      return;
    }
    while (presenter.presentedViewController != nil) {
      presenter = presenter.presentedViewController;
    }
    [presenter presentViewController:picker animated:YES completion:nil];
  });
}

RCT_REMAP_METHOD(saveBackup,
                 saveBackup:(NSString *)contents
                 fileName:(NSString *)fileName
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSData *bookmark = [[NSUserDefaults standardUserDefaults] dataForKey:@"backupFolderBookmark"];
  if (bookmark == nil) {
    reject(@"E_NO_BACKUP_FOLDER", @"Choose a backup folder first", nil);
    return;
  }

  BOOL isStale = NO;
  NSError *error = nil;
  NSURL *folderURL = [NSURL URLByResolvingBookmarkData:bookmark options:0 relativeToURL:nil bookmarkDataIsStale:&isStale error:&error];
  if (folderURL == nil || error != nil || isStale) {
    reject(@"E_BACKUP_FOLDER", @"The selected backup folder is no longer available", error);
    return;
  }

  BOOL accessing = [folderURL startAccessingSecurityScopedResource];
  NSURL *fileURL = [folderURL URLByAppendingPathComponent:fileName];
  NSFileCoordinator *coordinator = [[NSFileCoordinator alloc] initWithFilePresenter:nil];
  __block NSError *writeError = nil;
  [coordinator coordinateWritingItemAtURL:fileURL options:NSFileCoordinatorWritingForReplacing error:&error byAccessor:^(NSURL *coordinatedURL) {
    [contents writeToURL:coordinatedURL atomically:YES encoding:NSUTF8StringEncoding error:&writeError];
  }];
  if (accessing) {
    [folderURL stopAccessingSecurityScopedResource];
  }
  if (error != nil || writeError != nil) {
    reject(@"E_BACKUP_WRITE", @"Could not write the backup", writeError ?: error);
    return;
  }
  resolve(@YES);
}

- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls
{
  NSURL *folderURL = urls.firstObject;
  if (folderURL == nil) {
    [self finishWithResult:[NSNull null]];
    return;
  }

  NSError *error = nil;
  NSData *bookmark = [folderURL bookmarkDataWithOptions:0 includingResourceValuesForKeys:nil relativeToURL:nil error:&error];
  if (bookmark == nil || error != nil) {
    if (self.folderReject != nil) {
      self.folderReject(@"E_BACKUP_FOLDER", @"Could not remember the selected backup folder", error);
      self.folderResolve = nil;
      self.folderReject = nil;
    }
    return;
  }
  [[NSUserDefaults standardUserDefaults] setObject:bookmark forKey:@"backupFolderBookmark"];
  [self finishWithResult:@YES];
}

- (void)documentPickerWasCancelled:(UIDocumentPickerViewController *)controller
{
  [self finishWithResult:[NSNull null]];
}

- (void)finishWithResult:(id)result
{
  if (self.folderResolve != nil) {
    self.folderResolve(result);
    self.folderResolve = nil;
    self.folderReject = nil;
  }
}

@end