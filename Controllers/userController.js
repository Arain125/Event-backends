const userModel = require("../Models/UserSchema")
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const userController = {
    getSingleUser: async (req, res) => {
        const { id } = req.params

        const user = await userModel.findById(id)

        if (!user) {
            res.json({
                message: "User not found",
                status: false
            })
        } else {
            res.json({
                message: "User found",
                data: user,
                status: true
            })
        }
    },
    getAllUsers: async (req, res) => {
        const users = await userModel.find()
        if (users.length > 0) {
            res.json({
                message: "Users found",
                data: users,
                status: true
            })
        } else {
            res.json({
                message: "No users found",
                status: false
            })
        }
    },
    signupUser: async (req, res) => {
        const { name, role, email, password, queryAnswer } = req.body
        // Validate the data
        if (!name || !role || !email || !password || !queryAnswer) {
            res.json({
                message: "Please fill in all fields",
                status: false
            })
        } else {
            // Hash the password
            const hashPassword = await bcrypt.hash(password, 10)

            // Check if user already exists
            const user = await userModel.findOne({ email })
            if (user) {
                res.json({
                    message: "User already exists with this email address",
                    status: false
                })
            } else {
                // Create new user
                const newUser = new userModel({
                    name,
                    role,
                    email,
                    password: hashPassword,
                    queryAnswer
                })

                newUser.save()
                res.json({
                    message: "User created successfully",
                    data: newUser,
                    status: true
                })

            }
        }

    },
    loginUser: async (req, res) => {
        const { email, password } = req.body

        // Validate the data
        if (!email || !password) {
            res.json({
                message: "Please fill in all fields",
                status: false
            })
        } else {
            // Check if user already exists
            const user = await userModel.findOne({ email })
            if (!user) {
                res.json({
                    message: "account doesnot exist please signup first",
                    status: false
                })
            }

            if (user) {
                const comparePassword = await bcrypt.compare(password, user.password)

                // Check if password matches
                if (comparePassword) {
                    res.json({
                        message: "Logged in successfully",
                        data: user,
                        status: true
                    })
                } else {
                    res.json({
                        message: "Incorrect password",
                        status: false
                    })
                }

            }




        }

    },
    updateUser: async (req, res) => {
        const { id } = req.params
        const { name, role, email, password } = req.body

        const objToSend = { name, role, email, password }
        const updateUser = await userModel.findByIdAndUpdate(id, objToSend, { new: true })
        if (updateUser) {
            res.json({
                message: "User updated successfully",
                data: updateUser,
                status: true
            })
        } else {
            res.json({
                message: "something went wrong",
                status: false
            })
        }
    },
    deleteUser: async (req, res) => {
        const { id } = req.params
        const deleteUser = await userModel.findByIdAndDelete(id)

        if (deleteUser) {
            res.json({
                message: "User deleted successfully",
                data: deleteUser,
                status: true
            })
        } else {
            res.json({
                message: "something went wrong",
                status: false
            })
        }
    },
    forgetPassword: async (req, res) => {
        const { email, queryAnswer, newPassword } = req.body;

        if (!email || !queryAnswer || !newPassword) {
            return res.status(400).json({ error: "All fields are required." });
        }

        try {
            const user = await userModel.findOne({ email });
            if (!user) return res.status(404).json({ error: "User not found." });

            if (user.queryAnswer !== queryAnswer) {
                return res.status(401).json({ error: "Security answer is incorrect." });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();

            res.json({ message: "Password has been reset successfully." });
        } catch (err) {
            console.error("Error in password reset:", err);
            res.status(500).json({ error: "Server error." });
        }
    },
    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;

        const user = await userModel.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token", status: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        res.json({ message: "Password updated successfully", status: true });
    }
}


module.exports = userController