import {
    LoginUserRequest,
    RegisterUserRequest,
    toUserResponse,
    UpdateUserRequest,
    UserResponse
} from "../model/user-model";
import {UserValidation} from "../validation/user-validation";
import {prismaClient} from "../application/database";
import {HTTPException} from "hono/http-exception";
import {User} from "@prisma/client";

export class UserService {

    static async register(request: RegisterUserRequest): Promise<UserResponse> {
        // Validasi request registrasi menggunakan UserValidation
        request = UserValidation.REGISTER.parse(request);

        // Periksa apakah username sudah ada di database
        const totalUserWithSameUsername = await prismaClient.user.count({
            where: {
                username: request.username
            }
        });

        if (totalUserWithSameUsername !== 0) {
            // Jika username sudah ada, throw HTTPException dengan status 400
            throw new HTTPException(400, {
                message: "Username already exists"
            });
        }

        // Hash password menggunakan bcrypt
        request.password = await Bun.password.hash(request.password, {
            algorithm: "bcrypt",
            cost: 10
        });

        // Simpan data user baru ke database
        const user = await prismaClient.user.create({
            data: request
        });

        // Kembalikan response setelah konversi ke format UserResponse
        return toUserResponse(user);
    }

    static async login(request: LoginUserRequest): Promise<UserResponse> {
        // Validasi request login menggunakan UserValidation
        request = UserValidation.LOGIN.parse(request);

        // Cari user berdasarkan username di database
        let user = await prismaClient.user.findUnique({
            where: {
                username: request.username
            }
        });

        // Jika username tidak ditemukan, throw HTTPException dengan status 401
        if (!user) {
            throw new HTTPException(401, {
                message: "Username or password is wrong"
            });
        }

        // Verifikasi password yang dimasukkan menggunakan bcrypt
        const isPasswordValid = await Bun.password.verify(request.password, user.password, "bcrypt");

        // Jika password salah, throw HTTPException dengan status 401
        if (!isPasswordValid) {
            throw new HTTPException(401, {
                message: "Username or password is wrong"
            });
        }

        // Tambahkan token unik (UUID) pada data user
        user = await prismaClient.user.update({
            where: {
                username: request.username
            },
            data: {
                token: crypto.randomUUID()
            }
        });

        // Tambahkan token ke response dan kembalikan hasilnya
        const response = toUserResponse(user);
        response.token = user.token!;

        return response;
    }

    static async get(token: string | undefined | null): Promise<User> {
        const result = UserValidation.TOKEN.safeParse(token);

        if (result.error) {
            throw new HTTPException(401, {
                message: "Unauthorized"
            });
        }

        token = result.data;

        const user = await prismaClient.user.findFirst({
            where: {
                token: token
            }
        });

        if (!user) {
            throw new HTTPException(401, {
                message: "Unauthorized"
            });
        }

        return user;
    }

    static async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
        request = UserValidation.UPDATE.parse(request);

        if (request.name) {
            user.name = request.name;
        }

        if (request.password) {
            user.password = await Bun.password.hash(request.password, {
                algorithm: "bcrypt",
                cost: 10
            });
        }

        user = await prismaClient.user.update({
            where: {
                username: user.username
            },
            data: user
        });

        return toUserResponse(user);
    }

    static async logout(user: User): Promise<boolean> {
        await prismaClient.user.update({
            where: {
                username: user.username
            },
            data: {
                token: null
            }
        });

        return true;
    }
}