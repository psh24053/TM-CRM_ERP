/**
Copyright 2017 ToManage

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

@author    ToManage SAS <contact@tomanage.fr>
@copyright 2014-2017 ToManage SAS
@license   http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
International Registered Trademark & Property of ToManage SAS
*/


const moment = require('moment'),
		fixedWidthString = require('fixed-width-string'),
		fs = require('fs'),
		path = require("path");

exports.name = 'stock';
exports.version = '1.03';
exports.enabled = true;
exports.description = "Gestion du stock";
exports.rights = {};
exports.menus = {
		"menu:stock": {
				"position": 60,
				"perms": "stock.read",
				"enabled": "$conf->stock->enabled",
				"usertype": 2,
				"icon": "fa-random",
				"title": "Stock",
				"submenus": {
						"menu:inventory": {
								"url": "/erp/#!/product/inventory",
								"position": 10,
								"usertype": 2,
								"perms": "product.read",
								"enabled": "$conf->product->enabled",
								"icon": "fa fa-line-chart",
								"title": "products:Inventory"
						},
						"menu:stockdetail": {
								"url": "/erp/#!/product/stockdetail",
								"position": 40,
								"usertype": 2,
								"perms": "product.read",
								"enabled": "$conf->product->enabled",
								"icon": "fa fa-line-chart",
								"title": "products:StockDetail"
						},
						"menu:stockcorrestion": {
								"url": "/erp/#!/product/stockcorrectionlist",
								"position": 50,
								"usertype": 2,
								"perms": "product.read",
								"enabled": "$conf->product->enabled",
								"icon": "fa fa-pencil",
								"title": "products:StockCorrection"
						}
				}
		}
};

exports.pdfModels = [{
		code: 'STOCKRETURN',
		module: 'stock',
		forSales: true,
		latex: 'stockreturn.tex', //latex main file in latex directory
		langs: [{
				title: 'Retour produits',
				description: "Retour (default)"
		}]
}];
exports.latex = {
		"formatters": {
				"jsonDatecValue": 'dateShort',
				"jsonDatexpValue": 'dateShort',
				"jsonToValueAddressStreet": "area",
				"jsonTotalValue": function(self, options) {
						const values = options.value;

						const streamTotal = fs.createWriteStream(path.join(self.dirPath, 'totals.tex'), {
								flags: 'a'
						});

						for (let i = 0; i < values.length; i++) {
								let v = values[i];
								if (v.tophline) {
										if (v.tophline == 2)
												streamTotal.write('\\hline\n');
										streamTotal.write('\\hline\n');
								}

								if (v.italic)
										streamTotal.write("\\textit{{0}} &".format(self.formatter({
												value: v.label
										}, null)));
								else
										streamTotal.write("\\textbf{{0}} &".format(self.formatter({
												value: v.label
										}, null)));

								if (v.unit)
										streamTotal.write("{0} {1} \\\\\n".format(self.formatter({
												value: v.value,
												type: 'number'
										}, null), v.unit || ""));
								else
										streamTotal.write("{0} \\\\\n".format(self.formatter({
												value: v.value,
												type: 'euro'
										}, null)));

								if (v.buttomhline) {
										if (v.buttomhline == 2)
												streamTotal.write('\\hline\n');
										streamTotal.write('\\hline\n');
								}

						}
						streamTotal.end();

						return "";
				},
				"jsonLinesRefValue": function(self, options) {
						/*Lines WITH Ref columns */

						const values = options.value;

						const stream = fs.createWriteStream(path.join(self.dirPath, 'linesRef.tex'), {
								flags: 'a'
						});

						//stream.write("\\vspace{-2em}\n");
						if (self.handlers.pdfModel && self.handlers.pdfModel.value)
								stream.write("\\vspace{{0}cm}\n".format(self.handlers.pdfModel.value.htop || 0));

						stream.write('\\newcommand{\\specialcell}[2][c]{\\parbox[#1]{8.3cm}{#2}}\n');

						stream.write(`
\\setlength\\LTleft{0pt}
\\setlength\\LTright{0pt}
\\setlength\\LTpre{5pt}
\\setlength\\LTpost{0pt}

`);


						stream.write(`
\\begin{longtable}{|r|r|p{8.5cm}@{\\extracolsep{1mm plus 1fil}}|r|r|}
\\hline
N &
\\multicolumn{1}{c}{R\\'ef} &
\\multicolumn{1}{c|}{D\\'esignation} &
\\multicolumn{1}{c}{Qté cmdée} &
\\multicolumn{1}{c|}{Qté retournée} \\\\
\\hline \\hline
\\endfirsthead

\\hline
\\multicolumn{5}{|l|}{\\small\\sl suite de la page pr\\'ec\\'edente}\\\\
\\hline
N &
\\multicolumn{1}{c}{R\\'ef} &
\\multicolumn{1}{c|}{D\\'esignation} &
\\multicolumn{1}{c}{Qté cmdée} &
\\multicolumn{1}{c|}{Qté retournée} \\\\
\\hline \\hline
\\endhead

\\hline \\multicolumn{5}{|r|}{{\\small\\sl suite sur la prochaine page}} \\\\ \\hline
\\endfoot

\\hline
\\endlastfoot
`);

						for (let i = 0; i < values.length; i++) {
								let v = values[i];


								if (v.tophline) {
										if (v.tophline == 2)
												stream.write('\\hline\n');
										stream.write('\\hline\n');
								}

								switch (v.type) {
										case 'product':
												stream.write("{{0}} &".format(self.formatter({
														value: v.seq
												})));

												stream.write("{{0}} &".format(self.formatter({
														value: v.ref
												})));

												if (!v.description)
														stream.write("\\specialcell[t]{\\textbf{{0}\\\\}} &".format(self.formatter({
																value: v.label
														})));
												else
														stream.write("\\specialcell[t]{\\textbf{{0}}\\\\{1}\\\\} &".format(self.formatter({
																value: v.label
														}), self.formatter({
																value: v.description,
																type: 'area'
														})));

												stream.write("{1} {0} &".format(self.formatter({
														value: v.unit
												}), self.formatter({
														value: v.qty_order,
														type: 'number',
														precision: 2
												})));
												stream.write("{0}".format(self.formatter({
														value: v.qty,
														type: 'number',
														precision: 2
												})));


												stream.write("\\\\[10pt]\n");
												break;

								}

								if (v.buttomhline) {
										if (v.buttomhline == 2)
												stream.write('\\hline\n');
										stream.write('\\hline\n');
								}

						}

						stream.write('\\end{longtable}');

						if (self.handlers.pdfModel && self.handlers.pdfModel.value)
								stream.write("\\vspace{{0}cm}\n".format(self.handlers.pdfModel.value.hbuttom || 0));

						stream.end();

						return "";

				}
		}
};

F.on('load', function() {
		const ModulesModel = MODEL('modules').Schema;

		ModulesModel.insert(exports, function(err, doc) {
				if (err)
						return console.log("Error update module {0} : {1} ".format(exports.name, err));
		});
});