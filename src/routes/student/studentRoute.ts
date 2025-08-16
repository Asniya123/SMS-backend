import { Router } from "express"
import StudentController from "../../controllers/student/studentcontroller"
import studentService from "../../services/student/studentService"
import userCourseRouter from "../user/userCourseRoute"

const router = Router()

const studentcontroller = new StudentController(studentService)

router.post('/login', studentcontroller.login.bind(studentcontroller))
router.post('/refresh-token', studentcontroller.refreshUserAccessToken.bind(studentcontroller))

// Public/user-facing course APIs
router.use('/courses', userCourseRouter)

export default router