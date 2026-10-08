#import <React/RCTBridgeModule.h>
#import <WidgetKit/WidgetKit.h>

@interface WidgetBridge : NSObject <RCTBridgeModule>
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