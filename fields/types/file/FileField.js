/**
TODO:
- Format size of stored file (if present) using bytes package?
- Display file type icon? (see LocalFileField)
*/

import Field from '../Field';
import React, { PropTypes } from 'react';
import {
	Button,
	FormField,
	FormInput,
	FormNote,
} from '../../../admin/client/App/elemental';
import FileChangeMessage from '../../components/FileChangeMessage';
import HiddenFileInput from '../../components/HiddenFileInput';
import ImageThumbnail from '../../components/ImageThumbnail';
import Lightbox from 'react-images';


let uploadInc = 1000;

const buildInitialState = (props) => ({
	action: null,
	removeExisting: false,
	uploadFieldPath: `File-${props.path}-${++uploadInc}`,
	userSelectedFile: null,
	dataUri: null,
	loading: false,
	lightboxIsVisible: false,
});

module.exports = Field.create({
	propTypes: {
		autoCleanup: PropTypes.bool,
		collapse: PropTypes.bool,
		label: PropTypes.string,
		note: PropTypes.string,
		path: PropTypes.string.isRequired,
		value: PropTypes.shape({
			filename: PropTypes.string,
			// TODO: these are present but not used in the UI,
			//       should we start using them?
			// filetype: PropTypes.string,
			// originalname: PropTypes.string,
			// path: PropTypes.string,
			// size: PropTypes.number,
		}),
	},
	statics: {
		type: 'File',
		getDefaultValue: () => ({}),
	},
	getInitialState () {
		return buildInitialState(this.props);
	},
	shouldCollapse () {
		return this.props.collapse && !this.hasExisting();
	},
	componentWillUpdate (nextProps) {
		// Show the new filename when it's finished uploading
		if (this.props.value.filename !== nextProps.value.filename) {
			this.setState(buildInitialState(nextProps));
		}
	},

	// ==============================
	// HELPERS
	// ==============================

	hasFile () {
		return this.hasExisting() || !!this.state.userSelectedFile;
	},
	hasExisting () {
		return this.props.value && !!this.props.value.filename;
	},
	getFilename () {
		return this.state.userSelectedFile
			? this.state.userSelectedFile.name
			: this.props.value.filename;
	},

	// ==============================
	// METHODS
	// ==============================

	triggerFileBrowser () {
		this.refs.fileInput.clickDomNode();
	},
	isImage () {
		const str = this.state.userSelectedFile ? this.state.userSelectedFile.type : this.props.value ? this.props.value.mimetype : '';
		const SUPPORTED_REGEX = new RegExp(/^image\/|application\/pdf|application\/postscript/g);
		try {
			return (str.match(SUPPORTED_REGEX));
		}
		catch (err) {
			return false;
		}

	},
	handleFileChange (event) {
		const userSelectedFile = event.target.files[0];

		this.setState({
			userSelectedFile: userSelectedFile,
		});


		if (!window.FileReader) {
			return alert('File reader not supported by browser.');
		}

		var reader = new FileReader();
		if (!userSelectedFile) return;

		/*
		if (this.isImage(userSelectedFile.filename)) {
			this.setState({
				dataUri: null,
				loading: false,
			});
			return;
		}
		*/

		reader.readAsDataURL(userSelectedFile);

		reader.onloadstart = () => {
			this.setState({
				loading: true,
			});
		};
		reader.onloadend = (upload) => {
			this.setState({
				dataUri: upload.target.result,
				loading: false,
			});
			// this.props.onChange({ file: userSelectedFile });
		};
	},
	handleRemove (e) {
		var state = {};

		if (this.state.userSelectedFile) {
			state = buildInitialState(this.props);
		} else if (this.hasExisting()) {
			state.removeExisting = true;

			if (this.props.autoCleanup) {
				if (e.altKey) {
					state.action = 'reset';
				} else {
					state.action = 'delete';
				}
			} else {
				if (e.altKey) {
					state.action = 'delete';
				} else {
					state.action = 'reset';
				}
			}
		}

		this.setState(state);
	},
	undoRemove () {
		this.setState(buildInitialState(this.props));
	},

	// ==============================
	// RENDERERS
	// ==============================

	renderFileNameAndChangeMessage () {
		const href = this.props.value ? this.props.value.url : undefined;
		return (
			<div>
				{(this.hasFile() && !this.state.removeExisting) ? (
					<FileChangeMessage href={href} target="_blank">
						{this.getFilename()}
					</FileChangeMessage>
				) : null}
				{this.renderChangeMessage()}
			</div>
		);
	},
	renderChangeMessage () {
		if (this.state.userSelectedFile) {
			return (
				<FileChangeMessage color="success">
					Save to Upload
				</FileChangeMessage>
			);
		} else if (this.state.removeExisting) {
			return (
				<FileChangeMessage color="danger">
					File {this.props.autoCleanup ? 'deleted' : 'removed'} - save to confirm
				</FileChangeMessage>
			);
		} else {
			return null;
		}
	},
	renderClearButton () {
		if (this.state.removeExisting) {
			return (
				<Button variant="link" onClick={this.undoRemove}>
					Undo Remove
				</Button>
			);
		} else {
			var clearText;
			if (this.state.userSelectedFile) {
				clearText = 'Cancel Upload';
			} else {
				clearText = (this.props.autoCleanup ? 'Delete File' : 'Remove File');
			}
			return (
				<Button variant="link" color="cancel" onClick={this.handleRemove}>
					{clearText}
				</Button>
			);
		}
	},
	renderActionInput () {
		// If the user has selected a file for uploading, we need to point at
		// the upload field. If the file is being deleted, we submit that.
		if (this.state.userSelectedFile || this.state.action) {
			const value = this.state.userSelectedFile
				? `upload:${this.state.uploadFieldPath}`
				: (this.state.action === 'delete' ? 'remove' : '');
			return (
				<input
					name={this.getInputName(this.props.path)}
					type="hidden"
					value={value}
				/>
			);
		} else {
			return null;
		}
	},
	hasLocal () {
		return !!this.state.userSelectedFile;
	},
	renderImagePreview () {
		// const { value } = this.props;
		console.log(this.props.value);
		// render icon feedback for intent
		let mask;
		if (this.hasLocal()) mask = 'upload';
		else if (this.state.removeExisting) mask = 'remove';
		else if (this.state.loading) mask = 'loading';

		// const shouldOpenLightbox = value.format !== 'pdf';

		return (
			<ImageThumbnail
				component="a"
				href={this.state.dataUri ? this.state.dataUri : this.props.value.url}
				onClick={this.openLightbox}
				mask={mask}
				target="__blank"
				style={{ float: 'left', marginRight: '1em' }}
			>
				<img src={this.state.dataUri ? this.state.dataUri : this.props.value.url} style={{ height: 90 }} />
			</ImageThumbnail>
		);
	},
	openLightbox (event) {
		event.preventDefault();
		this.setState({
			lightboxIsVisible: true,
		});
	},
	closeLightbox () {
		this.setState({
			lightboxIsVisible: false,
		});
	},
	renderLightbox () {
		/*
		const { value } = this.props;

		if (!value || !value.public_id) return;
		*/


		return (
			<Lightbox
				currentImage={0}
				images={[{ src: this.state.dataUri ? this.state.dataUri : this.props.value.url }]}
				isOpen={this.state.lightboxIsVisible}
				onClose={this.closeLightbox}
				showImageCount={false}
			/>
		);
	},
	renderUI () {
		const { label, note, path } = this.props;
		const buttons = (
			<div style={this.hasFile() ? { marginTop: '1em' } : null}>
				<Button onClick={this.triggerFileBrowser}>
					{this.hasFile() ? 'Change' : 'Upload'} File
				</Button>
				{this.hasFile() && this.renderClearButton()}
			</div>
		);
		// console.log()
		return (
			<div data-field-name={path} data-field-type="file">
				<FormField label={label} htmlFor={path}>
					{this.hasFile() && this.isImage() ? (
						this.renderImagePreview()
					) : (null)}
					{this.shouldRenderField() ? (
						<div>
							{this.hasFile() && this.renderFileNameAndChangeMessage()}
							{buttons}
							<HiddenFileInput
								key={this.state.uploadFieldPath}
								name={this.state.uploadFieldPath}
								onChange={this.handleFileChange}
								ref="fileInput"
							/>
							{this.renderActionInput()}
						</div>
					) : (
						<div>
							{this.hasFile()
								? this.renderFileNameAndChangeMessage()
								: <FormInput noedit>no file</FormInput>}
						</div>
					)}
					{!!note && <FormNote html={note} />}
					{this.renderLightbox()}
				</FormField>
			</div>
		);
	},

});
