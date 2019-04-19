import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './SendReports.scss';
import {actions} from "_redux/_actions";
import {parseFormattedEmailAddress, calculateNextIndex} from "_helpers";
import {connect} from "react-redux";
import _ from 'lodash';
import dateFormat from "dateformat";

const CONSTANTS = {
	NEW_EMAIL_ADDRESS:'New Email Address',
	NEW_EMAIL_INDEX: 99999
};

class Email extends Component {
	constructor(props) {
		super(props);
		this.state ={
			focus : false
		};
	}

	keyPressed = undefined;

	handleBlur = (e)=>{
		let newEmail = e.target.innerText;
		newEmail = parseFormattedEmailAddress(newEmail);
		const newEmailObject = {...this.props.emailObject,email:newEmail};

		this.props.updateEmailState(newEmailObject);

		this.setState({
			focus:false
		});

		e.target.innerText = newEmail.displayName ? newEmail.displayName : newEmail.address.value;

		this.props.onChange(e,newEmailObject);
	};

	handleFocus = (e) => {
		let newEmailText = this.props.emailObject.email.raw;

		e.target.innerText = newEmailText;

		if(newEmailText === CONSTANTS.NEW_EMAIL_ADDRESS){
			const el = ReactDOM.findDOMNode(this.refs.email);

			// SELECT ALL TEXT
			if (document.body.createTextRange) {
				let range = document.body.createTextRange();
				range.moveToElementText(el);
				range.select();
			} else if (window.getSelection) {
				let selection = window.getSelection();
				let range = document.createRange();
				range.selectNodeContents(el);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}

		this.setState({focus:true});
	};

	handleChange = (e)=>{
		const newText = e.target.innerText;
		const newEmailObject = {...this.props.emailObject,email: parseFormattedEmailAddress(newText)};
 		this.props.updateEmailState(newEmailObject);
		this.props.onChange(e,newEmailObject,true);
	};

	componentDidMount(){
		const email = this.props.emailObject.email;

		// initialize email text required because content editable fields do not work with 2 way binding.
		this.refs.email.innerText= email.displayName ? email.displayName : email.address.value;
	}

	handleKeyPress = (e)=>{
		const keyDown = e.which;
		const SPACE = 32;
		const BACKSPACE = 8;
		const ENTER = 13;
		if(keyDown === ENTER){
			// prevent Form Submit
			e.preventDefault();
			this.keyPressed = 'ENTER';
		}
		if(keyDown === BACKSPACE){
			this.keyPressed = 'BACKSPACE';
		}
		if(keyDown === SPACE){
			this.keyPressed = 'SPACE'
		}
	};

	handleKeyRelease = (e)=>{
		const keyUp = e.which;
		const BACKSPACE = 8;
		const SPACE = 32;
		const ENTER = 13;
		if(keyUp === BACKSPACE){
			this.keyPressed = undefined;
			//handleChange(e);
		} else if(keyUp === SPACE){
			this.keyPressed = undefined;
		} else if(keyUp === ENTER){
			this.handleEnter(e);
		}
	};

	handleEnter = (e)=>{
		const el = this.refs.email;
		el.blur();
	};

	componentWillReceiveProps(nextProps){
		const thisEmail = this.props.emailObject;
		const nextEmail = nextProps.emailObject;
		const wasSaving = this.props.savingInProgress;
		const doneSaving = !nextProps.savingInProgress;
		const inFocus = this.state.focus;

		// Handle if ID has been replaced for some reason like already existed in location list.
		if(thisEmail.id !== nextEmail.id){
			this.refs.email.innerText= nextEmail.email.raw;
		}

		// Enable edit when saving is done.
		if(wasSaving && doneSaving && inFocus){
			const el = this.refs.email;
			const email = nextProps.emailObject;
			el.innerText = email.displayName ? email.displayName : email.address.value;
			el.contentEditable = true;
			el.focus();
			this.setEndOfContentEditable(el);
		}

	}

	setEndOfContentEditable = (contentEditableElement)=>{
		let range,selection;
		if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
		{
			range = document.createRange();//Create a range (a range is a like the selection but invisible)
			range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
			range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
			selection = window.getSelection();//get the selection object (allows you to change selection)
			selection.removeAllRanges();//remove any selections already made
			selection.addRange(range);//make the range you have just created the visible selection
		}
		else if(document.selection)//IE 8 and lower
		{
			range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
			range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
			range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
			range.select();//Select the range (make it the visible selection
		}
	};

	render(){
		const valid = this.props.emailObject.email.address.valid;
		const inFocus = this.state.focus;
		return (
			<span className={'pretty-email' + (inFocus ? ' pretty-focus' : '')}>
				<span
					className={'pretty-email-input ' + (valid ? '' :'pretty-not-valid')}
					ref={'email'}
					id={'email_' + this.props.emailObject.index}
					contentEditable={!this.props.savingInProgress}
					onInput={this.handleChange}
					onBlur={this.handleBlur}
					onFocus={this.handleFocus}
					onMouseDownCapture={this.handleMouseUp}
					onKeyUp={this.handleKeyRelease}
					onKeyDown={this.handleKeyPress}
				>
				</span>
				<span
					contentEditable={false}
					className={'pretty-x'}
					onClick={this.props.removeEmail}
				>
				<i className="fa fa-times" aria-hidden="true"/>
			</span>
			</span>
		)
	}
}

class EmailDropDown extends Component {
	constructor(props) {
		super(props);
		this.state = {
			emailList: []
		}
	}

	handleMouseUp = (e)=>{
		const el = document.getElementById('dropdown');
		const clickOnDropDownHeader = e.target.parentElement === el;
		const clickOnDropDownItem = e.target.parentElement.parentElement === el;

		const clickedOnComponent = clickOnDropDownItem || clickOnDropDownHeader;

		if(clickedOnComponent){
			return
		}
		// close if click outside of modal.
		this.props.handleClose();
	};

	componentDidMount(){
		// Add mouse up listener to react to click outside of the modal.
		document.addEventListener ('mouseup', (e) => {this.handleMouseUp(e)});
		this.setState({
			emailList: [
				{
					id: undefined,
					index: CONSTANTS.NEW_EMAIL_INDEX,
					email: parseFormattedEmailAddress('+ Add Contact'),
					isSendEmail: false
				},
				...this.props.emailList
			]
		})
	}

	handleItemClick(ev,emailObject){
		const newAddress = emailObject.index === CONSTANTS.NEW_EMAIL_INDEX ? CONSTANTS.NEW_EMAIL_ADDRESS : emailObject.email.raw;
		const newId = emailObject.index === CONSTANTS.NEW_EMAIL_INDEX ? undefined : emailObject.id;

		const newEmailObject = {
			...emailObject,
			id:newId,
			email:parseFormattedEmailAddress(newAddress),
			message: undefined
		};
		this.props.handleSelection(ev,newEmailObject)
	}

	render(){
		// remove emails that are in the To field.
		const emails = this.state.emailList.reduce((array,email)=>{
			const id = email.id;
			const notInToList = this.props.toEmailList.find(e=>e.id === id) === undefined;
			if(notInToList){
				array.push(email);
			}
			return array
		},[]);

		return (
			<div
				id={'dropdown'}
				ref={'dropDown'}
				className={'pretty-drop-down'}
			>
				<span>
					Choose a contact
				</span>
				<ul>
					{emails.map((emailObject,index)=>{
						return (
							<li
								key={index + "_emailDropdown"}
								onClick={(ev)=>{this.handleItemClick(ev,emailObject)}}
							>
								{emailObject.email.displayName?emailObject.email.displayName:emailObject.email.address.value}
							</li>
						)
					})}
				</ul>
			</div>
		)
	}

}

class SendReport extends Component {
	constructor(props) {
		super(props);

		let emailBody = 'Example email text';

		this.state ={
			toEmails:undefined,
			subject: 'Ready to send 🚀',
			body: emailBody,
			locationEmails: [],
			loading: true,
			showDropDown: false,
			saving: false,
			lastSaved: undefined,
			sending: false
		};
		this.debounceSaveEmail = _.debounce(this.saveEmail,10)
	}

	handleSend= ()=>{
		const {body,subject,toEmails} = this.state;

		const email = {
			toLocationContacts: toEmails.map(e=>e.id.toString()),
			messageBody: body,
			messageSubject: subject,
			bccEmailLists: [],
			ccEmailLists: [],
		};

		this.setState({sending:true});
		this.props.dispatch(actions.sendEmail(email))
			.then(
				()=>{
					this.setState({sending:false});
					this.props.close()
				},
				()=>{
					this.setState({sending:false})
				}
			);

	};

	componentDidMount(){
		this.props.dispatch(actions.getEmails())
			.then(emails=>{
				// parse email string to object
				emails = Object.values(emails).map((emailObj,i)=>{
					return {
						...emailObj,
						email: parseFormattedEmailAddress(emailObj.email),
						index: i
					}
				});

				// build list or to emails based on isSendEmail
				const toEmails = emails.filter((e)=>e.isSendEmail);

				this.setState({
					toEmails:toEmails,
					locationEmails: emails,
					loading: false
				})
			});
		//disable scroll
		document.body.style.overflow = "hidden";
	}

	componentWillUnmount(){
		// reset allow scroll
		document.body.style.overflow = "auto"
	}

	handleRemoveEmailFormTo = (emailObj)=>{
		let newList = this.state.toEmails.filter(e=>{
			return e.index !== emailObj.index
		});
		this.setState({toEmails: newList});
	};

	handleShowDropDown = ()=>{
		this.setState({showDropDown:!this.state.showDropDown});
	};

	handleAddEmail = (e,email)=>{
		// adds Email to state not DB as there is no email address at first.
		const newList = [
			...this.state.toEmails,
			{
				...email,
				index: (calculateNextIndex(this.state.toEmails.map(e=>e.index)))
			}

		];

		this.setState({showDropDown:false,toEmails:newList});
	};

	emailAddressUpdated = (emailObject,noDb) => {
		const index = emailObject.index;
		// Save email for possibility of being updated
		let newEmail = emailObject;

		const newEmails = this.state.toEmails.map(e=>{
			if(e.index === index){
				newEmail = {...emailObject,email:emailObject.email,message:undefined, valid:emailObject.email.address.valid};
				return newEmail
			}
			return e
		});


		this.setState({toEmails:newEmails});
		this.debounceSaveEmail(newEmail,noDb);
	};

	saveEmail = (emailObject,noDb)=>{
		const UpdateDB = !noDb;
		const index = emailObject.index;
		const address = emailObject.email.address.value;
		const fullAddress = (emailObject.email.displayName ? emailObject.email.displayName : '') + (emailObject.email.displayName ? "<" + emailObject.email.address.value + ">" : emailObject.email.address.value);
		const validAddress = emailObject.email.address.valid;
		let id = emailObject.id;
		let isSendEmail = emailObject.isSendEmail;

		// Allowing anything to be saved.
		// if email is invalid prevent send but allow to be saved to DB.
		const validEmail = emailObject.email !== '';

		if(validEmail){
			const emailAlreadyInList = this.state.toEmails.find(email=>email.index !== index && email.email.address.value.toLowerCase() === address.toLowerCase()) !== undefined;
			const inLocationList = this.state.locationEmails.find(email=>email.id !== undefined && email.id !== emailObject.id && email.email.address.value.toLowerCase() === address.toLowerCase());


			if(inLocationList && !emailAlreadyInList){
				//console.log('Email in location list but not TO:',inLocationList);
				// If user types in an email that is in the location emails but not in the to email TO list we replace the existing ID with the location email ID.
				const locationEmail = inLocationList;

				// Replace email in TO: emails with email in location list.
				let newEmails = this.state.toEmails.map(e=>{
					if(e.index === index){
						return locationEmail
					}
					return e
				});

				// if the email that was typed already had an id delete that email.
				if(emailObject.id){
					//console.log('Remove email as it had an id but exists in',emailObject.id);
					this.removeEmailHandler(emailObject,true);
					const newEmailList = this.state.locationEmails.filter(e=>e.id === emailObject.id);
					this.setState({ locationEmails: newEmailList });
				}

				this.setState({ toEmails: newEmails });

				return
			}

			if(emailAlreadyInList){
				//console.log("Email Already Added!", emailObject);
				const newEmails = this.state.toEmails.map(e=>{
					if(e.index === index){
						return {...e,id:undefined, message:'Email is already added.', selected:false}
					}
					return e
				});

				this.setState({toEmails:newEmails});

				// If we have a DB id remove email from DB as it was a dup.
				if(id !== undefined){
					//console.log('Remove email as it is already in email list');
					this.removeEmailHandler(emailObject,true);
				}
				return
			}

			if(UpdateDB) {
				//console.log("UPDATE DB!");
				isSendEmail = validAddress ? isSendEmail : false;
				this.setState({saving:true});

				this.props.dispatch(actions.addEmail({id, fullAddress, isSendEmail}))
					.then(emailList => {
						const newId = emailList.id;
						let newToEmails = this.state.toEmails;
						let newLocationEmails = this.state.locationEmails;
						const newEmail = !id && newId;

						if (newEmail) {
							// If item this is a new DB item update the toEmails and add to location Emails.
							newToEmails = this.state.toEmails.map(e => {
								if (e.index === index) {
									return {...e, id: newId, isSendEmail}
								}
								return e
							});

							newLocationEmails.push({
								...emailObject,
								id:newId,
								index:calculateNextIndex(newLocationEmails.map(e=>e.index))
							})

						} else {

							newLocationEmails = this.state.locationEmails.map(e=>{
								if(e.id === id) {
									return {...e, id: newId, isSendEmail}
								}
								return e
							});

						}

						this.setState({
							toEmails: newToEmails,
							locationEmails: newLocationEmails,
							lastSaved: dateFormat("longTime"),
							saving:false
						});

					})
			}
		}
	};

	removeEmailHandler = (thisEmail, dbOnly=false) => {
		let newLocationEmailList = this.state.locationEmails;
		let newToEmailList = this.state.toEmails;
		if(dbOnly){
			// ** RULE **: When updating location list always use id as the index is different between the TO list and the location List.

			// Do not remove the entry just the id so the next update is a fresh DB entry.
			newLocationEmailList = newLocationEmailList.map(e=>{
				if(e.id === thisEmail.id){
					return {...e,id:undefined}
				}
				return e
			});

			//TODO Make sure this is what you want to do.
			newToEmailList = newToEmailList.map(e=>{
				if(e.index === thisEmail.index){
					return {...e,id:undefined}
				}
				return e
			})

		} else {
			newLocationEmailList = newLocationEmailList.filter(email => (email.index !== thisEmail.index));
			newToEmailList = newToEmailList.filter(email => (email.index !== thisEmail.index));
		}
		this.setState({
			toEmails:newToEmailList,
			locationEmails: newLocationEmailList
		});

		if(thisEmail.id){
			this.props.dispatch(actions.removeEmails(thisEmail.id))
		}
	};

	handleCloseDropDown = (e)=>{
		// reset allow scroll
		document.body.style.overflow = "auto";
		this.setState({showDropDown:false});
	};

	updateEmailState = (emailObj)=>{
		const newEmails = this.state.toEmails.map(e=>{
			return (e.index === emailObj.index) ? emailObj : e
		});

		// TODO: I believe I need to update the location list with any changes in the to field that have a matching ID.
		const newLocationEmails = this.state.locationEmails.map(e=>{
			return (e.id === emailObj.id && emailObj.id !== undefined) ? {...e,email: emailObj.email} : e
		});
		this.setState({toEmails:newEmails, locationEmails: newLocationEmails})
	};

	handleTextChange = (e,fieldName)=> {
		let newState = {};
		newState[fieldName] = e.target.value;
		this.setState(newState);
	};

	render() {
		const sendingReport = this.state.sending;
		const loadingLocationContacts = this.state.loading;
		const toEmailsInTheList = this.state.toEmails ? (this.state.toEmails.length > 0) : false;
		let modalHeight = '100%';
		const screenHeight = window.innerHeight;
		if (screenHeight < 610) {
			modalHeight = screenHeight - 50 + 'px';
		}
		return (
			<div className={'modal-window'} style={ { height: modalHeight } }>
				<div className={'modal-content'}>
					<div className={'modal-header'}>
						<h5 className={'modal-title'}>Composer </h5>
						<button type={'button'} className={'close'} data-dismiss={'modal'} aria-label={'Close'} onClick={this.props.close}>
							<span aria-hidden={'true'}>&times;</span>
						</button>
					</div>
					<div className={'modal-body email-body'}>
						<div className={'email-field-container'}>
							<div className={'send-report-form-group to-field'}>
								<div className={'row report-send-row'}>
									<div className={'col-md-1'}>
										<label className={'text-right'}>To</label>
									</div>

									<div className={'col-md-11'}>
										<div className={'pretty-input'} id={'send-to-email'} onClick={this.recompileEmailAddresses}>
											{!loadingLocationContacts
													? this.state.toEmails && this.state.toEmails.map((emailObj, index) => {
														return <Email
															key={index}
															index={index}
															emailObject={emailObj}
															removeEmail={()=>{this.handleRemoveEmailFormTo(emailObj)}}
															onChange={(e,emailObject,noDb)=>{this.emailAddressUpdated(emailObject,noDb)}}
															updateEmailState = {this.updateEmailState}
															savingInProgress = {this.state.saving}
															locationsLoading = {loadingLocationContacts}
														/>
													})
													: <span><i className="fas fa-spinner fa-pulse"/>&nbsp;&nbsp;&nbsp;loading contacts for this location...</span>
											}
											{!toEmailsInTheList && !loadingLocationContacts &&
												<span>
													Click + to add people to this email.
												</span>
											}
											{!loadingLocationContacts &&
												<div className={'pretty-add'} onClick={!loadingLocationContacts?this.handleShowDropDown:undefined}>
													<i className="fas fa-plus"/>
												</div>
											}
										</div>
										{this.state.showDropDown &&
											<EmailDropDown
												emailList={this.state.locationEmails}
												toEmailList={this.state.toEmails}
												handleSelection={this.handleAddEmail}
												handleClose={this.handleCloseDropDown}
											/>
										}
									</div>
								</div>
							</div>
							<div className={'send-report-form-group bcc-field'}>
								<div className={'row report-send-row'}>
									<div className={'col-md-1'}>
										<label className={'text-right'}>Subject</label>
									</div>
									<div className={'col-md-11'}>
										<input
											className={'form-control report-send-input'}
											type={'text'}
											value={this.state.subject}
											onChange={(e)=>this.handleTextChange(e,'subject')}
										/>
									</div>
								</div>
							</div>
							<div className={'send-report-form-group bcc-field'}>
								<div className={'row report-send-row'}>
									<div className={'col-md-1'}>
										<label className={'text-right'}><i className="fas fa-paperclip"/></label>
									</div>
									<div className={'col-md-11'}>
										<div className={"pdf-download-icon"}>
											<i className="far fa-file-pdf"/>
											<span> Attachment.pdf</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className={'send-report-form-group body-field'}>
								<div className={'message-body'}>
									<textarea
										className={'form-control report-send-textarea'}
										value={this.state.body}
										onChange={(e)=>this.handleTextChange(e,'body')}
									/>
								</div>
							</div>
					</div>
					<div className={'modal-footer'}>
						<button
							type={'button'}
							disabled={loadingLocationContacts || !toEmailsInTheList || sendingReport}
							className={'btn btn-cta btn-experian-light-blue'}
							onClick={!loadingLocationContacts && !sendingReport ? this.handleSend : undefined}
						>
							{sendingReport ? 'Sending...' : 'Send It!'}
						</button>
					</div>
				</div>
			</div>
		)
	}
}

export default connect()(SendReport)
