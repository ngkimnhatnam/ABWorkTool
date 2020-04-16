#Work tool for AirBnb management

#Stacks to be used:
	* Front-end: HTML,CSS, JS, Bootstrap, jQuery
	* Backend: NodeJS, Express 
	* Database: MongoDB
	
#RESTful routes

Name	Path			Verb	Purpose							Mongoose Method
Index	/task			GET		List all tasks =>				Task.find()
New		/task/new		GET		Show new task form =>			N/A
Create	/task			POST	Create task then redirects =>	Task.create()
Show	/task/:id		GET		Show one specific task =>		Task.findById()
Edit	/task/:id/edit	GET		Show edit form for one task =>	Task.findById()
Update	/task/:id		PUT		Update specific task, redirects	Task.findByIdAndUpdate()
Destroy	/task/:id		DELETE	Delete task, redirects			Task.findByidAndRemove()

#DONE
* 7 RESTful routes for task&unit
* Signup, login, master/common account
* Vertical authorization (users see own tasks only)
* Horizontal authorization (master account set up/edit/delete tasks/unit)
* Sorting by date + reformat date + system time via Moment JS
* Implement Archive/History functionality (comparing dates and archive obsoletes)
* Color code imcoming tasks by date(yellow for near & green for faraway)
* Master account created via master code

#TO BE DONE
* Randomize password when creating sub accs
* Password retrieval via email & password change
* Notification systems to master account of completed task
* Sort by date, unit, user
* Notification of upcoming task
* Adjust layout, font, color, background



