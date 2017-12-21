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

exports.name = 'delivery';
exports.version = 1.03;
exports.enabled = true;

exports.csv = {
		"model": "order",
		"schema": "GoodsOutNote",
		"aliases": {
				"supplier.fullName": "Client",
				"ref": "Ref",
				"ref_client": "Ref_Client",
				"salesPerson.fullName": "Commercial",
				"datedl": "Date exp",
				"qty": "Qte",
				"Status": "Statut",
				"entity": "Entite",
				"status.isPrinted": "Impression",
				"status.isPicked": "Scanne",
				"status.isPacked": "Emballe",
				"status.isShipped": "Expedie",
				"status.printedBy": "Impression par",
				"status.pickedBy": "Scanne par",
				"status.packedBy": "Emballe par",
				"status.shippedBy": "Expedie par",
				"datec": "Date creation",
				"weight": "Poids",
				"logisticMethod": "Taille carton"
				//"createdBy.user": "Created By User",
				//"createdBy.date": "Created By Date",
				//"editedBy.user": "Edited By User",
				//"editedBy.date": "Edited By Date"
		},

		"arrayKeys": {
				// "groups.users": true,
				// "groups.group": true
		},

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
				"Impression": function(date) {
						return moment(date).format(CONFIG('dateformatLong'));
				},
				"Scanne": function(date) {
						return moment(date).format(CONFIG('dateformatLong'));
				},
				"Emballe": function(date) {
						return moment(date).format(CONFIG('dateformatLong'));
				},
				"Expedie": function(date) {
						return moment(date).format(CONFIG('dateformatLong'));
				}
		}
};

exports.description = "Gestion des bon de livraisons";
exports.rights = [{
				"desc": "Lire les bons livraisons clients",
				"perm": {
						"read": true
				}
		},
		{
				"desc": "Creer/modifier les bons livraisons clients",
				"perm": {
						"create": false
				}
		},
		{
				"desc": "Valider les bons livraisons clients",
				"perm": {
						"validate": false
				}
		},
		{
				"desc": "Envoyer les bons livraisons clients",
				"perm": {
						"send": true
				}
		},
		{
				"desc": "Cloturer les bons livraisons clients",
				"perm": {
						"closed": false
				}
		},
		{
				"desc": "Re-ouvrir un bon de livraison",
				"perm": {
						"reopen": false
				}
		},
		{
				"desc": "Annuler les bons livraisons clients",
				"perm": {
						"cancel": false
				}
		},
		{
				"desc": "Supprimer les bons livraisons clients",
				"perm": {
						"delete": false
				}
		},
		{
				"desc": "Affichager la pre-facturation des bons de livraisons",
				"perm": {
						"prefac": false
				}
		},
		{
				"desc": "Générer la facturation des bons de livraisons",
				"perm": {
						"createBills": false
				}
		},
		{
				"desc": "Exporter les bons livraisons clients et attributs",
				"perm": {
						"export": false
				}
		}
];
exports.menus = {
		"menu:delivery": {
				"position": 50,
				"perms": "delivery.read",
				"enabled": "delivery.enabled",
				"usertype": 2,
				"icon": "fa-truck",
				"title": "orders:Logistics",
				route: "delivery",
				params: {
						forSales: 1
				},
				"submenus": {
						"menu:deliverylist": {
								"position": 1,
								route: "delivery.list",
								params: {
										forSales: 1
								},
								"perms": "delivery.read",
								"enabled": "delivery->enabled",
								"usertype": 2,
								"icon": "fa-truck",
								"title": "orders:PreparationReceipt"
						},
						"menu:deliverysuppliers": {
								"position": 5,
								route: "delivery.list",
								params: {
										forSales: 0
								},
								"perms": "delivery.read",
								"enabled": "delivery->enabled",
								"usertype": 2,
								"icon": "fa-truck",
								"title": "orders:SuppliersDeliveries"
						},
						"menu:stockreturn": {
								"position": 15,
								"url": "/erp/#!/stockreturn",
								"perms": "delivery.read",
								"enabled": "delivery->enabled",
								"usertype": 2,
								"icon": "fa-refresh",
								"title": "orders:StockReturn"
						}
				}
		}
};
exports.filters = {
		"delivery": {
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

				"warehouse": {
						"displayName": "Warhouse",
						"backend": "warehouse"
				},

				"salesPerson": {
						"displayName": "Assigned To",
						"backend": "salesPerson"
				},

				"workflow": {
						"displayName": "Status",
						"backend": "workflow._id"
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

				"array": ["supplier", "salesPerson", "workflow", "channel", "name"]
		}
};

exports.pdfModels = [{
		code: 'deliveryDefault',
		module: 'delivery',
		forSales: true,
		isDefault: true,
		latex: 'delivery.tex', //latex main file in latex directory
		langs: [{
				title: "Bon de livraison",
				description: "BL (default)"
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
\\multicolumn{1}{c|}{Qté dans le colis} \\\\
\\hline \\hline
\\endfirsthead

\\hline
\\multicolumn{5}{|l|}{\\small\\sl suite de la page pr\\'ec\\'edente}\\\\
\\hline
N &
\\multicolumn{1}{c}{R\\'ef} &
\\multicolumn{1}{c|}{D\\'esignation} &
\\multicolumn{1}{c}{Qté cmdée} &
\\multicolumn{1}{c|}{Qté dans le colis} \\\\ \\hline \\hline
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
														precision: 3
												})));
												stream.write("{0}".format(self.formatter({
														value: v.qty,
														type: 'number',
														precision: 3
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