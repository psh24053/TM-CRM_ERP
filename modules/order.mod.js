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

exports.name = 'order';
exports.version = 1.021;
exports.enabled = true;

exports.csv = {
		"model": "order",
		"schema": "Order",
		"aliases": {
				"ref": "Ref",
				"supplier.fullName": "Client",
				"ref_client": "Ref_Client",
				"salesPerson.fullName": "Commercial",
				"datedl": "Date exp",
				"Status": "Statut",
				"entity": "Entite",
				"total_ht": "Total HT",
				"total_ttc": "Total TTC",
				"status.allocateStatus": "Reserve",
				"status.fulfillStatus": "Rempli",
				"status.shippingStatus": "Expedie",
				"status.invoiceStatus": "Facture",

				"datec": "Date creation"
		},

		"arrayKeys": {},

		"formatters": {
				"Date exp": function(date) {
						return moment(date).format(CONFIG('dateformatLong'));
				},

				"Date creation": function(date) {
						return moment(date).format(CONFIG('dateformatLong'));
				},

				"Statut": function(Status) {
						const OrderStatus = MODEL('order').Status;

						let result = MODULE('utils').Status(Status, OrderStatus);
						return result.name;
				},
				"Reserve": function(value) {
						switch (value) {
								case 'NOT':
										return 'Aucun';
										break;
								case 'NOA':
										return 'Partiel';
										break;
								case 'ALL':
										return 'Complet';
										break;
								default:
										return "-";
						}
				},
				"Rempli": function(value) {
						switch (value) {
								case 'NOT':
										return 'Aucun';
										break;
								case 'NOA':
										return 'Partiel';
										break;
								case 'ALL':
										return 'Complet';
										break;
								default:
										return "-";
						}
				},
				"Expedie": function(value) {
						switch (value) {
								case 'NOT':
										return 'Aucun';
										break;
								case 'NOA':
										return 'Partiel';
										break;
								case 'ALL':
										return 'Complet';
										break;
								default:
										return "-";
						}
				},
				"Facture": function(value) {
						switch (value) {
								case 'NOT':
										return 'Aucun';
										break;
								case 'NOA':
										return 'Partiel';
										break;
								case 'ALL':
										return 'Complet';
										break;
								default:
										return "-";
						}
				}
		}
};

exports.description = 'Gestion des commandes clients';
exports.rights = [{
				"desc": "Lire les commandes clients",
				"perm": {
						"read": true
				}
		},
		{
				"desc": "Creer/modifier les commandes clients",
				"perm": {
						"create": false
				}
		},
		{
				"desc": "Valider les commandes clients",
				"perm": {
						"validate": false
				}
		},
		{
				"desc": "Re-ouvrir les commandes clients",
				"perm": {
						"reopen": false
				}
		},
		{
				"desc": "Envoyer les commandes clients",
				"perm": {
						"send": true
				}
		},
		{
				"desc": "Clôturer les commandes clients",
				"perm": {
						"closed": false
				}
		},
		{
				"desc": "Annuler les commandes clients",
				"perm": {
						"cancel": false
				}
		},
		{
				"desc": "Supprimer les commandes clients",
				"perm": {
						"delete": false
				}
		},
		{
				"desc": "Expedier les commandes clients",
				"perm": {
						"createDelivery": false
				}
		},
		{
				"desc": "Exporter les commandes clients et attributs",
				"perm": {
						"export": false
				}
		}
];
exports.menus = {
		"menu:orders": {
				"position": 30,
				"perms": "order.read",
				"enabled": "$conf->commande->enabled",
				"usertype": 2,
				"icon": "fa-shopping-cart",
				"title": "orders:Orders",
				route: "order",
				params: {
						forSales: 1
				},
				"submenus": {
						"menu:orderslist": {
								"position": 50,
								route: "order.list",
								params: {
										forSales: 1
								},
								"perms": "order.read",
								"enabled": "$conf->commande->enabled",
								"usertype": 2,
								"icon": "fa-shopping-cart",
								"title": "orders:ListOfOrders"
						}
				}
		}
};
exports.filters = {
		"order": {
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

				"workflow": {
						"displayName": "Status",
						"backend": "workflow._id"
				},

				"allocationStatus": {
						"displayName": "Allocation Status",
						"backend": "status.allocateStatus",
						"type": "string"
				},

				"fulfilledStatus": {
						"displayName": "Fulfilled Status",
						"backend": "status.fulfillStatus",
						"type": "string"
				},

				"shippingStatus": {
						"displayName": "Shipping Status",
						"backend": "status.shippingStatus",
						"type": "string"
				},


				"invoiceStatus": {
						"displayName": "Invoice Status",
						"backend": "status.invoiceStatus",
						"type": "string"
				},

				"channel": {
						"displayName": "Channel",
						"backend": "channel._id"
				},

				"name": {
						"displayName": "Reference",
						"backend": "_id"
				},

				"datedl": {
						"type": "date",
						"backend": {
								"key": "datedl",
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

				"array": ["supplier", "salesPerson", "workflow", "allocationStatus", "fulfilledStatus", "shippingStatus", "channel", "name"]
		}
};

exports.pdfModels = [{
		code: 'ORDER',
		module: 'order',
		forSales: true,
		latex: 'order.tex', //latex main file in latex directory
		langs: [{
				title: 'Commande',
				description: "BdC (default)"
		}]
}, {
		code: 'ORDER_PROF',
		module: 'order',
		forSales: true,
		latex: 'order.tex', //latex main file in latex directory
		langs: [{
				title: 'Facture pro forma',
				description: "Facture pro forma"
		}]
}];

exports.latex = {
		"formatters": {
				"jsonDatecValue": 'dateShort',
				"jsonDatexpValue": 'dateShort',
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
								stream.write('\\newcommand{\\specialcell}[2][c]{\\parbox[#1]{7.2cm}{#2}}\n');

						else
								stream.write('\\newcommand{\\specialcell}[2][c]{\\parbox[#1]{9.7cm}{#2}}\n');

						stream.write(`
\\setlength\\LTleft{0pt}
\\setlength\\LTright{0pt}
\\setlength\\LTpre{5pt}
\\setlength\\LTpost{0pt}

`);

						if (options.isDiscount)
								stream.write(`
\\begin{longtable}{|r|p{7.5cm}@{\\extracolsep{1mm plus 1fil}}|l|c|r|r|r|r|}
\\hline
N &
\\multicolumn{1}{c|}{D\\'esignation} &
Qt\\'e &
Un &
PU &
Remise &
Total HT &
\\multicolumn{1}{c|}{TVA} \\\\
\\hline \\hline
\\endfirsthead

\\hline
\\multicolumn{8}{|l|}{\\small\\sl suite de la page pr\\'ec\\'edente}\\\\
\\hline
N &
\\multicolumn{1}{c|}{D\\'esignation} &
Qt\\'e &
Un &
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
\\begin{longtable}{|r|p{9.5cm}@{\\extracolsep{1mm plus 1fil}}|l|c|r|r|r|}
\\hline
N &
\\multicolumn{1}{c|}{D\\'esignation} &
Qt\\'e &
Un &
PU &
Total HT &
\\multicolumn{1}{c|}{TVA} \\\\
\\hline \\hline
\\endfirsthead

\\hline
\\multicolumn{7}{|l|}{\\small\\sl suite de la page pr\\'ec\\'edente}\\\\
\\hline
N &
\\multicolumn{1}{c|}{D\\'esignation} &
Qt\\'e &
Un &
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
														stream.write("\\specialcell[t]{\\textbf{\\underline{{0}}\\\\}} &".format(self.formatter({
																value: v.label
														})));
												else
														stream.write("\\specialcell[t]{\\textbf{\\underline{{0}}}\\\\{1}\\\\} &".format(self.formatter({
																value: v.label
														}), self.formatter({
																value: v.description,
																type: 'area'
														})));

												stream.write("{0} & {1} &".format(self.formatter({
														value: v.qty,
														type: 'number',
														precision: 3
												}), self.formatter({
														value: v.unit
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

												stream.write("\\specialcell[t]{\\textbf{\\textit{\\textcolor{red}{{0} : {1}}}}\\\\} &".format(self.formatter({
														value: v.label
												}), self.formatter({
														value: v.description,
														type: 'string'
												})));

												stream.write('& & &');
												if (options.isDiscount)
														stream.write('&');

												stream.write("\\textbf{\\textit{\\textcolor{red}{{0}}}} &".format(self.formatter({
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

												stream.write("\\specialcell[t]{\\textbf{\\textit{\\textcolor{red}{{0} : {1}}}}\\\\} &".format(self.formatter({
														value: v.label
												}), self.formatter({
														value: v.description,
														type: 'string'
												})));

												stream.write('& &');
												if (options.isDiscount)
														stream.write('&');

												stream.write("\\textbf{\\textit{\\textcolor{red}{{0}}}} &".format(self.formatter({
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
