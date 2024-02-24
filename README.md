# Microlight
![Logo](/assets/logo192.png)
## About
airplane.dev had this ability to enable non technical folks to execute tasks which are defined in code. This was super useful. Schedule the task and the task runs like a cron with a visual interface to inspect. Each tasks return meaningful console log as well as user readable output. This because useful for things like upload and process an excel file periodically, option to restart production server etc. can now be done my a non-technical person with a clear SOP. The code or logic is still written by a technical person. 

Airplane.dev has a ton of other features as well. They tried to make the platform no-code. This repo trys to replace Airplane.dev's super code features only. We are calling it "microlight" because like an real airplane, microlights can flight but microlight hardly have any other features or ability than fly. With microlight we have removed 90% of airplane features and retained on 10% of the feature that we actually liked. 

### Microlight can do
- Execution logic has to be written with code (will not no support no code ever)
- Tasks can be executed by non techincal people from a GUI
- Tasks can be scheduled 
- Show console logs and execution output

thats it

### Microlight cannot and will not do
- No code support
- Multiple server or master/worker mode


Microlight is designed as simple solution. This is not designed for massive scale. Intentionally Microlight does not support master/worker node. The Microlight server and the execution of task happens on the same machine. If you are looking for a multi node setup, then we recomment using rundeck. For most small startups, rundeck is an overkill. Scaling microlight can only be done by vertical scaling (increasing the size of the server). Microlight does not support horizontal scaling. 


## Installation
```shell
npm install 
node app.js
```
