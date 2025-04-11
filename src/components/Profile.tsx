import { ReactElement, useEffect, useState } from "react";
import { GetUser } from "../services/api";
import { useParams } from "react-router-dom";
import { Button } from "react-bootstrap";

export function Profile() {

    const user = JSON.parse(localStorage.getItem('user')!);
    // return (<div>{user.displayName}</div>)
    return (
        <div className="container mt-4">
            <div className="my-4">
                Profile Page
            </div>
            <div className="card">
                <div className="card-header">
                    User Profile
                </div>
                <div className="card-body">
                    <div className="d-flex">
                        <p>Email: {user?.email}</p><Button className="btn btn-primary">Change</Button>
                    </div>
                    <div className="d-flex col-sm-4">
                        <p>Display Name: {user?.displayName}</p><Button className="btn btn-primary">Change</Button>
                    </div>
                    {user?.admin && (
                        <>
                            <div>Admin</div>
                        </>
                    )}
                </div>
                <div className="card-footer">
                    Profile Footer
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    User Security
                </div>
                <div className="card-body">

                    <p>Password</p>
                    <Button className="btn btn-primary">Change Password</Button>
                    {/* <p>Email: {user?.email}</p>
                    <p>Display Name: {user?.displayName}</p> */}

                </div>
                <div className="card-footer">
                    Profile Footer
                </div>
            </div>

        </div>
    )
}