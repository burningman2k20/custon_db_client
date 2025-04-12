import { useNavigate } from "react-router-dom"

export function Dashboard() {

    const navigate = useNavigate();

    return (
        <div className="container mt-4">


            <div className="card">
                <div className="card-header">
                    <h2>User DashBoard</h2>

                </div>
                <div className="card-body">

                    <div className="container d-flex col-sm-10">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title"><img className="img-thumbnail img-size" src='storage_icon.png' />File Storage</div>
                            </div>
                            <div className="card-body">
                                <div className="card-img-top">

                                </div>
                                <div className="card-text">
                                    <p>The current users file storage, where they can upload pictures, text files, etc.</p>


                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn btn-primary" onClick={() => navigate('/storage')}>Storage</button>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div className="card-title"><img className="img-thumbnail img-size" src='db_icon.png' />Database Collections</div>
                            </div>
                            <div className="card-body">
                                <div className="card-img-top">

                                </div>
                                <div className="card-text">
                                    <p>The current users database. Used to store information for applications</p>

                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn btn-primary" onClick={() => navigate('/collections')}>Collections</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>




        </div>
    )
}