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

"use strict";

const moment = require('moment'),
		fixedWidthString = require('fixed-width-string'),
		fs = require('fs'),
		path = require("path");

exports.name = "bill";
exports.version = 1.013;
exports.enabled = true;
exports.csv = {
		"model": "invoice",
		"schema": "invoice",
		"aliases": {
				"ref": "Ref",
				"supplier.fullName": "Client",
				"ref_client": "Ref_Client",
				"salesPerson.fullName": "Commercial",
				"datec": "Date de facture",
				"dater": "Date de paiement",
				"total_ht": "Total HT",
				"total_ttc": "Total TTC",
				"total_paid": "Deja paye",
				"total_to_paid": "Restant du",
				"Status": "Statut",
				"entity": "Entite",
				"createdAt": "Date creation"
		},

		"arrayKeys": {},

		"formatters": {
				"Date de facture": function(date) {
						return moment(date).format(CONFIG('dateformatLong'));
				},
				"Date de paiement": function(date) {
						return moment(date).format(CONFIG('dateformatLong'));
				},
				"Date creation": function(date) {
						return moment(date).format(CONFIG('dateformatLong'));
				},
				"Statut": function(Status) {
						const OrderStatus = MODEL('order').Status;

						let result = MODULE('utils').Status(Status, OrderStatus);
						return result.name;
				}
		}
};
exports.description = "Gestion des factures";

exports.rights = [{
				"desc": "Lire les factures",
				"perm": {
						"read": true
				}
		},
		{
				"desc": "Creer/modifier les factures",
				"perm": {
						"create": false
				}
		},
		{
				"desc": "Dévalider les factures",
				"perm": {
						"unvalidate": false
				}
		},
		{
				"desc": "Valider les factures",
				"perm": {
						"validate": true
				}
		},
		{
				"desc": "Envoyer les factures par mail",
				"perm": {
						"send": true
				}
		},
		{
				"desc": "Emettre des paiements sur les factures",
				"perm": {
						"paiment": false
				}
		},
		{
				"desc": "Supprimer les factures",
				"perm": {
						"delete": false
				}
		},
		{
				"desc": "Exporter les factures clients, attributs et reglements",
				"perm": {
						"export": false
				}
		}
];

exports.menus = {
		"menu:invoices": {
				"position": 70,
				"perms": "bill.read",
				"enabled": "$conf->facture->enabled",
				"usertype": 2,
				"icon": "fa-files-o",
				"title": "orders:Bills",
				route: "bill",
				"submenus": {
						"menu:billslist": {
								"position": 1,
								route: "bill.list",
								params: {
										forSales: 1
								},
								"perms": "bill.read",
								"icon": "fa-money",
								"enabled": "$conf->facture->enabled",
								"usertype": 2,
								"title": "orders:CustomersInvoices"
						},
						"menu:billssupplierlist": {
								"position": 10,
								route: "bill.list",
								params: {
										forSales: 0
								},
								"perms": "bill.supplier.read",
								"icon": "fa-money",
								"enabled": "$conf->facture->enabled",
								"usertype": 2,
								"title": "orders:SuppliersInvoices"
						}
				}
		}
};

exports.filters = {
		"invoice": {
				"forSales": {
						"backend": "forSales",
						"type": "boolean"
				},

				"ref": {
						"displayName": "Ref",
						"backend": "ref",
						"type": "regex"
				},

				"ref_client": {
						"displayName": "Ref customer",
						"backend": "ref_client",
						"type": "regex"
				},

				"entity": {
						"displayName": "Entity",
						"backend": "entity",
						"type": "string"
				},

				"Status": {
						"displayName": "Status",
						"backend": "Status",
						"type": "string"
				},

				"supplier": {
						"displayName": "Customer",
						"backend": "supplier"
				},

				"salesPerson": {
						"displayName": "Assigned To",
						"backend": "salesPerson"
				},

				"channel": {
						"displayName": "Channel",
						"backend": "channel._id"
				},

				"name": {
						"displayName": "Reference",
						"backend": "_id"
				},

				"dater": {
						"type": "date",
						"backend": {
								"key": "dater",
								"operator": ["$gte", "$lte"]
						}
				},

				"datec": {
						"type": "date",
						"backend": {
								"key": "datec",
								"operator": ["$gte", "$lte"]
						}
				},

				"total_ht": {
						"type": "number",
						"backend": {
								"key": "total_ht",
								"operator": ["$gte", "$lte"]
						}
				},
				"array": ["supplier", "salesPerson", "workflow", "channel", "name"]
		}
};

exports.pdfModels = [{
		code: 'invoiceDefault',
		module: 'bill',
		forSales: true,
		latex: 'bill.tex', //latex main file in latex directory
		langs: [{
				title: "Facture",
				description: "Facture (default)"
		}]
}, {
		code: 'invoiceSupplierDefault',
		module: 'bill',
		forSales: false,
		latex: 'bill_supplier.tex', //latex main file in latex directory
		langs: [{
				title: "Facture Fourn.",
				description: "Facture fourn. (default)"
		}]
}];

exports.latex = {
		"formatters": {
				"jsonAPAYERValue": 'euro',
				"jsonDatecValue": 'dateShort',
				"jsonDateechValue": 'dateShort',
				"jsonToValueAddressStreet": "area",
				"jsonCouponValue": function(self, options) {
						console.log(options);
						if (options.value == 'CHQ')
								return `\\begin{minipage}[t]{0.45\\textwidth}
\\ding{33}\\dotfill
\\raisebox{-0.25\\baselineskip}{\\ding{34}}\\dotfill
\\raisebox{-0.50\\baselineskip}{\\ding{35}}\\dotfill
\\vspace{-1em}
\\begin{center}
\\textbf{Coupon r\\\`eglement a joindre avec vote ch\\\`eque}
\\end{center}

\\setlength\\parindent{24pt}

\\indent \\jsonTitleValue : \\textbf{\\jsonRefValue}\\\\
\\indent Montant : \\jsonAPAYERValue

\\setlength\\parindent{0pt}

\\ding{33}\\dotfill
\\raisebox{-0.25\\baselineskip}{\\ding{34}}\\dotfill
\\raisebox{-0.50\\baselineskip}{\\ding{35}}\\dotfill
\\vspace{-1em}

\\end{minipage}
`;
						return "";

				},
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
				"jsonLinesValue": function(self, options) {
						/*Lines WITHOUT Ref columns */

						const values = options.value;

						const stream = fs.createWriteStream(path.join(self.dirPath, 'lines.tex'), {
								flags: 'a'
						});

						stream.write("\\vspace{-2em}\n");
						if (self.handlers.pdfModel && self.handlers.pdfModel.value)
								stream.write("\\vspace{{0}cm}\n".format(self.handlers.pdfModel.value.htop || 0));

						stream.write(`
						\\begin{flushright}
						{\\flushright \\footnotesize \\textit{Montants exprim\\'es en \\euro}}
						\\vspace{-1em}
						\\end{flushright}`);

						if (options.isDiscount)
								//ligne de tableau avec \
								stream.write('\\newcommand{\\specialcell}[2][c]{\\parbox[#1]{7.7cm}{#2}}\n');

						else
								stream.write('\\newcommand{\\specialcell}[2][c]{\\parbox[#1]{9.2cm}{#2}}\n');

						stream.write(`
\\setlength\\LTleft{0pt}
\\setlength\\LTright{0pt}
\\setlength\\LTpre{5pt}
\\setlength\\LTpost{0pt}

`);

						if (options.isDiscount)
								stream.write(`
\\begin{longtable}{|r|p{8.0cm}@{\\extracolsep{1mm plus 1fil}}|r|c|r|r|r|r|}
\\hline
\\multicolumn{1}{|c}{N} &
\\multicolumn{1}{c|}{D\\'esignation} &
Un &
Qt\\'e &
PU &
Remise &
Total HT &
\\multicolumn{1}{c|}{TVA} \\\\
\\hline \\hline
\\endfirsthead

\\hline
\\multicolumn{8}{|l|}{\\small\\sl suite de la page pr\\'ec\\'edente}\\\\
\\hline
\\multicolumn{1}{|c}{N} &
\\multicolumn{1}{c|}{D\\'esignation} &
Un &
Qt\\'e &
PU &
Remise &
Total HT &
\\multicolumn{1}{c|}{TVA} \\\\ \\hline \\hline
\\endhead

\\hline \\multicolumn{8}{|r|}{{\\small\\sl suite sur la prochaine page}} \\\\ \\hline
\\endfoot

\\hline
\\endlastfoot`);

						else

								stream.write(`
\\begin{longtable}{|r|p{9.5cm}@{\\extracolsep{1mm plus 1fil}}|r|c|r|r|r|}
\\hline
\\multicolumn{1}{|c}{N} &
\\multicolumn{1}{c|}{D\\'esignation} &
Un &
Qt\\'e &
PU &
Total HT &
\\multicolumn{1}{c|}{TVA} \\\\
\\hline \\hline
\\endfirsthead

\\hline
\\multicolumn{7}{|l|}{\\small\\sl suite de la page pr\\'ec\\'edente}\\\\
\\hline
\\multicolumn{1}{|c}{N} &
\\multicolumn{1}{c|}{D\'esignation} &
Un &
Qt\\'e &
PU &
Total HT &
\\multicolumn{1}{c|}{TVA} \\\\ \\hline \\hline
\\endhead

\\hline \\multicolumn{7}{|r|}{{\\small\\sl suite sur la prochaine page}} \\\\ \\hline
\\endfoot

\\hline
\\endlastfoot`);

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

												stream.write("{0} & {1} &".format(self.formatter({
														value: v.unit
												}), self.formatter({
														value: v.qty,
														type: 'number',
														precision: 2
												})));
												stream.write("{0} &".format(self.formatter({
														value: v.pu_ht,
														type: 'number',
														precision: 3
												})));

												if (options.isDiscount)
														stream.write("{0} &".format(self.formatter({
																value: v.discount,
																type: 'percent',
																precision: 1
														})));

												stream.write("{0} &".format(self.formatter({
														value: v.total_ht,
														type: 'number',
														precision: 2
												})));
												stream.write("{0} \\\\[10pt]".format(self.formatter({
														value: v.tva_tx
												})));
												break;

										case 'comment':
												stream.write('&');

												if (!v.description)
														stream.write("\\specialcell[t]{\\textbf{{0}\\\\}} &".format(self.formatter({
																value: v.label
														})));
												else
														stream.write("\\specialcell[t]{\\textbf{{0}\\\\{1}\\\\}} &".format(self.formatter({
																value: v.label
														}), self.formatter({
																value: v.description,
																type: 'area'
														})));

												stream.write('& & &');

												if (options.isDiscount)
														stream.write('&');

												stream.write('&');
												stream.write('\\tabularnewline');
												break;

										case 'subtotal':
												stream.write('&');

												stream.write("\\specialcell[t]{\\textbf{\\textit{{0} : {1}}}} &".format(self.formatter({
														value: v.label
												}), self.formatter({
														value: v.description,
														type: 'string'
												})));

												stream.write('& & &');
												if (options.isDiscount)
														stream.write('&');

												stream.write("\\textbf{\\textit{{0}}} &".format(self.formatter({
														value: v.total_ht,
														type: 'number',
														precision: 2
												})));
												stream.write('\\tabularnewline');
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

				},
				"jsonLinesRefValue": function(self, options) {
						/*Lines WITH Ref columns */

						const values = options.value;

						const stream = fs.createWriteStream(path.join(self.dirPath, 'linesRef.tex'), {
								flags: 'a'
						});

						stream.write("\\vspace{-2em}\n");
						if (self.handlers.pdfModel && self.handlers.pdfModel.value)
								stream.write("\\vspace{{0}cm}\n".format(self.handlers.pdfModel.value.htop || 0));

						stream.write(`
					\\begin{flushright}
					{\\flushright \\footnotesize \\textit{Montants exprim\\'es en \\euro}}
					\\vspace{-1em}
					\\end{flushright}`);

						if (options.isDiscount)
								//ligne de tableau avec \
								stream.write('\\newcommand{\\specialcell}[2][c]{\\parbox[#1]{5.8cm}{#2}}\n');

						else
								stream.write('\\newcommand{\\specialcell}[2][c]{\\parbox[#1]{7.7cm}{#2}}\n');

						stream.write(`
\\setlength\\LTleft{0pt}
\\setlength\\LTright{0pt}
\\setlength\\LTpre{5pt}
\\setlength\\LTpost{0pt}

`);

						if (options.isDiscount)
								stream.write(`
\\begin{longtable}{|r|r|p{6.0cm}@{\\extracolsep{1mm plus 1fil}}|c|r|r|r|r|}
\\hline
\\multicolumn{1}{|c}{N} &
\\multicolumn{1}{c}{R\\'ef} &
\\multicolumn{1}{c|}{D\\'esignation} &
Qt\\'e &
PU &
Remise &
Total HT &
\\multicolumn{1}{c|}{TVA} \\\\
\\hline \\hline
\\endfirsthead

\\hline
\\multicolumn{8}{|l|}{\\small\\sl suite de la page pr\\'ec\\'edente}\\\\
\\hline
\\multicolumn{1}{|c}{N} &
\\multicolumn{1}{c}{R\\'ef} &
\\multicolumn{1}{c|}{D\\'esignation} &
Qt\\'e &
PU &
Remise &
Total HT &
\\multicolumn{1}{c|}{TVA} \\\\ \\hline \\hline
\\endhead

\\hline \\multicolumn{8}{|r|}{{\\small\\sl suite sur la prochaine page}} \\\\ \\hline
\\endfoot

\\hline
\\endlastfoot`);

						else

								stream.write(`
\\begin{longtable}{|r|r|p{8cm}@{\\extracolsep{1mm plus 1fil}}|c|r|r|r|}
\\hline
\\multicolumn{1}{|c}{N} &
\\multicolumn{1}{c}{R\\'ef} &
\\multicolumn{1}{c|}{D\\'esignation} &
Qt\\'e &
PU &
Total HT &
\\multicolumn{1}{c|}{TVA} \\\\
\\hline \\hline
\\endfirsthead

\\hline
\\multicolumn{7}{|l|}{\\small\\sl suite de la page pr\\'ec\\'edente}\\\\
\\hline
\\multicolumn{1}{|c}{N} &
\\multicolumn{1}{c}{R\\'ef} &
\\multicolumn{1}{c|}{D\'esignation} &
Qt\\'e &
PU &
Total HT &
\\multicolumn{1}{c|}{TVA} \\\\ \\hline \\hline
\\endhead

\\hline \\multicolumn{7}{|r|}{{\\small\\sl suite sur la prochaine page}} \\\\ \\hline
\\endfoot

\\hline
\\endlastfoot`);

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
														value: v.qty,
														type: 'number',
														precision: 3
												})));
												stream.write("{0} &".format(self.formatter({
														value: v.pu_ht,
														type: 'number',
														precision: 3
												})));

												if (options.isDiscount)
														stream.write("{0} &".format(self.formatter({
																value: v.discount,
																type: 'percent',
																precision: 1
														})));

												stream.write("{0} &".format(self.formatter({
														value: v.total_ht,
														type: 'number',
														precision: 2
												})));
												stream.write("{0} \\\\[10pt]".format(self.formatter({
														value: v.tva_tx
												})));
												break;

										case 'comment':
												stream.write('& &');

												if (!v.description)
														stream.write("\\specialcell[t]{\\textbf{{0}\\\\}} &".format(self.formatter({
																value: v.label
														})));
												else
														stream.write("\\specialcell[t]{\\textbf{{0}\\\\{1}\\\\}} &".format(self.formatter({
																value: v.label
														}), self.formatter({
																value: v.description,
																type: 'area'
														})));

												stream.write('& &');

												if (options.isDiscount)
														stream.write('&');

												stream.write('&');
												stream.write('\\tabularnewline');
												break;

										case 'subtotal':
												stream.write('& &');

												stream.write("\\specialcell[t]{\\textbf{\\textit{{0} : {1}}}} &".format(self.formatter({
														value: v.label
												}), self.formatter({
														value: v.description,
														type: 'string'
												})));

												stream.write('& &');
												if (options.isDiscount)
														stream.write('&');

												stream.write("\\textbf{\\textit{{0}}} &".format(self.formatter({
														value: v.total_ht,
														type: 'number',
														precision: 2
												})));
												stream.write('\\tabularnewline');
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
