import React from "react";
import axios from 'axios';
import './Home.css';
import loginJson from '../db.json';
import tableJson from '../table.json';
import loadingGif from '../gif.gif';

class Home extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            URL: "",
            SecNumber: "",
            BBEmail: "",
            BBPassword: "",
            processed: '...',
            priceLimit: "",
            confirmLimit: "",
            botRunning: false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSubmitLogin = this.handleSubmitLogin.bind(this);
    }
    
    //handle all of the input, save input into the state (update state)
    handleChange(event) {  
        const {name, value} = event.target;
        this.setState({
            [name]: value
        })
    }

    async handleSubmitLogin(event) {
        event.preventDefault();
        const { BBEmail, BBPassword } = this.state;

        const data = {
            BBEmail,
            BBPassword,
        }

        axios
        .post('/BBlogin', data)
    }

    //once submit the form, send form data to backend (proxy 3000 -> 3001) and put the data into the pup function 
    handleSubmit(event) {
        event.preventDefault();
        const { URL, SecNumber, processed, priceLimit } = this.state;

        this.setState({
            botRunning: true,
        })

        const data = {
            URL,
            SecNumber,
            processed,
            priceLimit,
        }
        //https://www.bestbuy.com/site/hot-wheels-worldwide-basic-car-styles-may-vary/6151804.p?skuId=6151804
        axios
        .post('/pup', data)
        .then((res) => {
            //if price over limit
            if(res.data.pup === undefined){
                this.setState({
                    confirmLimit: res.data.sentence,
                    botRunning: res.data.bot,
                })
            }else{ //if price isn't over limit
                this.setState({
                    botRunning: res.data.prod.bot,
                    processed: res.data.pup,
                    // fullItem: [[res.data.prod.prodName, res.data.prod.prodPrice, res.data.prod.prodImage], ...this.state.fullItem]
                })
            }
        })

        .catch(err => {
            console.error(err);
        });
    }

    
    render() {
        return (
            <div className="home">
                
                <div className="topBar">
                    <h2><span>B</span>estCart</h2>
                </div>

                <div className="formBox">
                    <form onSubmit={this.handleSubmitLogin}>
                        <div className="BBlogin">
                            <div className="form-group" id="e">
                                <input 
                                className="form-control"
                                type="text" 
                                id="email" 
                                name="BBEmail"
                                value={this.state.BBEmail}
                                onChange={this.handleChange} 
                                placeholder={loginJson.BBemail !== "" ? loginJson.BBemail : "BB email"}
                                required 
                                />
                            </div>
                            <div className="form-group" id="p">
                                <input 
                                className="form-control"
                                type="text" 
                                id="pass" 
                                name="BBPassword" 
                                value={this.state.BBPassword}
                                onChange={this.handleChange}
                                placeholder={loginJson.BBpass !== "" ? new Array((loginJson.BBpass).length + 1).join('*') : "BB password"} 
                                required 
                                />
                            </div>

                            <div className="but">
                                <button disabled={(!this.state.BBEmail || !this.state.BBPassword) || this.state.BBEmail === loginJson.BBemail && this.state.BBPassword === loginJson.BBpass} className="btn" type="submit">
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>

                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group" id="url">
                            <input 
                            className="form-control"
                            type="text" 
                            id="lurl" 
                            name="URL" 
                            value={this.state.URL}
                            onChange={this.handleChange}
                            placeholder="URL" 
                            required 
                            />
                        </div>

                        <div className="form-group" id="ip">
                            <input 
                            className="form-control"
                            type="text" 
                            id="sec" 
                            name="SecNumber" 
                            value={this.state.SecNumber}
                            onChange={this.handleChange}
                            placeholder="CVV" 
                            required 
                            />
                        </div>

                        <div className="form-group" id="pl">
                            <input 
                            className="form-control"
                            type="text" 
                            id="pl" 
                            name="priceLimit" 
                            value={this.state.priceLimit}
                            onChange={this.handleChange}
                            placeholder="Price Limit (optional, slower with a limit)"
                            />
                        </div> 

                        <div className="but">
                            {/* work on disabling button when bot is running */}
                            {this.state.botRunning ? <img src={loadingGif}/> : <></>}
                            <button disabled={this.state.botRunning} className="btn" type="submit">
                                Submit
                            </button> 
                        </div>
                    </form>
                </div>

                <p id="warning">{this.state.confirmLimit}</p>
                <p>Estimated checkout time is around 13 seconds, it may appear longer due to the time it takes to render the list</p>
                <table className ="tbl">
                    <thead>
                    <tr>
                        <th scope = "col">Order Status</th>
                        <th scope = "col">Product Name</th>
                        <th scope = "col">Product Price</th>
                        <th scope = "col">Product Image</th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            tableJson.map(item => {
                                return (
                                    <tr>
                                        <td>{item.processed}</td>
                                        <td>{item.name}</td>
                                        <td>{item.price}</td>
                                        <img src={item.image} width="125" height="125" alt='product'/>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        )
    }
}

export default Home
