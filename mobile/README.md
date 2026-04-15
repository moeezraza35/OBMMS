# React Native

Take an Android device minimum Android 11. Open `settings` > `About`. Find device serial number and tap multiple time until a message appear showing that developer options are enabled.

Go to your phone `settings` > `Developer options`. Turn on `Stay awake` and `USB Debug`. And connect your phone with development machine.

If you are not in `mobile` folder use this command:
> cd mobile/obmms

Here you need to install a package from https://github.com/moeezraza35/mr-wshandler-react/releases/tag/v0.1.0 and save it in the project folder with the name `dist`.

If you haven't install node packages then run the following command *for once*:
> npm install

Preventing the Gradle to launch emulator which can slow down your device use the following command to check your device ID.
> adb devices

Copy your device ID and run the mobile app using the following commands

> adb reverse tcp:3000 tcp:3000<br/>
> adb reverse tcp:8000 tcp:8000<br/>
> adb reverse --list<br/>
> npm run android --deviceId=&lt;paste-your-device-id&gt;

Replace `<paste-your-device-id>` with actual device id.