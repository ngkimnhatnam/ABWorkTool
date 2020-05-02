#Work tool for AirBnb management

#Stacks to be used:
	* Front-end: HTML,CSS, JS, Bootstrap, jQuery
	* Backend: NodeJS, Express, Mongoose
	* Database: MongoDB
	
#RESTful routes

#DONE
* 7 RESTful routes for task&unit
* Signup, login, master/common account (Passport)
* Horizontal authorization (users see own tasks only)
* Vertical authorization (master account set up/edit/delete tasks/unit)
* Sorting by date + reformat date + system time via Moment JS/ Sort by user,unit
* Implement Archive/History functionality (comparing dates and archive obsoletes)
* Color code imcoming tasks by date(yellow for near & green for faraway)
* Master account created via master code
* Password retrieval via email (Nodemailer) & password change
* Feedback functionality from users
* Notification systems to master account of completed task
* Randomize password when creating sub accs && send confirmation mail
* Flash messages
* Adjust layout, font, color, background
* Code sanitizing with express-sanitizer
* Refractor codes

#TO BE DONE
* Change heading text according to current page DONE
* Add sidenote to unit creation DONE
* Check sanitizer DONE
* Flash error and back() DONE
* Add register button to side menu master acc DONE
* Delete confirmation DONE

#Challenges
* Using two different jquery versions (fadeout dont work on slim version/dropdown dont in full)
* Using Browserify to use require() in htmls
* Display date when editing task




