import React from 'react';

import ItemsTableCell from '../../components/ItemsTableCell';
import ItemsTableValue from '../../components/ItemsTableValue';
import FileImageSummary from '../../components/columns/FileImageSummary';


var LocalFileColumn = React.createClass({
	renderValue: function () {
		var value = this.props.data.fields[this.props.col.path];
		if (!value || !value.filename) return;
		return value.filename;
	},
	isImage () {
		var value = this.props.data.fields[this.props.col.path];
		if (!value || !value.filename) return false;
		const str = value.mimetype;
		const SUPPORTED_REGEX = new RegExp(/^image\/|application\/pdf|application\/postscript/g);
		try {
			return (str.match(SUPPORTED_REGEX));
		}
		catch (err) {
			return false;
		}

	},
	renderImg () {
		var value = this.props.data.fields[this.props.col.path];
		if (!value || !Object.keys(value).length) return;

		return (
			<ItemsTableValue field={this.props.col.type}>
				<FileImageSummary image={value} />
			</ItemsTableValue>
		);

	},
	render: function () {
		var value = this.props.data.fields[this.props.col.path];
		var href = value && value.url ? value.url : null;
		var label = value && value.filename ? value.filename : null;
		return (
			<ItemsTableCell href={href} padded interior field={this.props.col.type}>
				{
					this.isImage() ? this.renderImg() : <ItemsTableValue>{label}</ItemsTableValue>
				}
			</ItemsTableCell>
		);
	},
});

module.exports = LocalFileColumn;
