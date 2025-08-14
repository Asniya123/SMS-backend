import { Router } from "express"
import StudentController from "../../controllers/student/studentcontroller"
import studentService from "../../services/student/studentService"

const router = Router()

const studentcontroller = new StudentController(studentService)

router.post('/login', studentcontroller.login.bind(studentcontroller))
router.post('/refresh-token', studentcontroller.refreshUserAccessToken.bind(studentcontroller))
export default router