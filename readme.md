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

