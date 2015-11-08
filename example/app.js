(function () {
	'use strict';
	angular
		.module('app', ['khchan.translate-editor'])
		.controller('AppCtrl', AppCtrl);

	AppCtrl.$inject = ['$scope'];

	function AppCtrl($scope) {
		$scope.languages = ['en', 'fr'];

		$scope.translations = {
			"en": {
				"APP": {
					"AUTH": {
						"TITLE": "Login",
						"USERNAME": "Username",
						"EMAIL": "Email",
						"USERNAME_OR_EMAIL": "Username or Email",
						"PASSWORD": "Password",
						"SIGN_IN": "Sign in",
						"SIGN_IN_ERROR": "Incorrect username or password"
					},
					"HEADER": {
						"TAGLINE": "An Open Platform for Prospective Data Collection in Clinical and Translational Research",
						"SELECTED_STUDY": "Selected Study:",
						"MENU": {
							"STUDIES": "Studies",
							"MY_STUDIES": "My Studies",
							"MY_PROFILE": "My Profile",
							"USER_MANAGER": "User Manager",
							"TOOLS": "Tools",
							"FORM_BUILDER": "Form Builder",
							"WORKFLOW_EDITOR": "Workflow Editor",
							"GROUPS": "Groups",
							"TRANSLATIONS": "Translations",
							"ACCESS_MANAGEMENT": "Access Management"
						},
						"SUBMENU": {
							"OVERVIEW": "Overview",
							"COLLECTION_CENTRES": "Collection Centres",
							"SUBJECTS": "Subjects",
							"USERS": "Users",
							"FORMS": "Forms",
							"SURVEYS": "Surveys"
						}
					},
					"STUDY": {
						"OVERVIEW": {
							"TITLE": "Study Overview: {{name}}",
							"ENROLLMENT": {
								"TITLE": "Enrollment",
								"COLLECTION_CENTRES": "Collection Centres",
								"CONTACT": "@:COMMON.MODELS.COLLECTION_CENTRE.CONTACT",
								"COORDINATORS": "Coordinators",
								"INTERVIEWERS": "Interviewers",
								"SUBJECTS": "Subjects",
								"SUBJECTS_ENROLLED": "Subjects Enrolled"
							},
							"STUDY_INFORMATION": {
								"TITLE": "Study Information"
							}
						},
						"SUBJECT": {
							"CONTROLS": {
								"OPEN_BTN": "View Subject",
								"NEW_BTN": "Add Subject",
								"EDIT_BTN": "Edit Subject",
								"ARCHIVE_BTN": "Archive"
							}
						},
						"USER": {
							"CONTROLS": {
								"SAVE_CHANGES": "Save Changes",
								"OPEN_BTN": "View User",
								"NEW_BTN": "Add User",
								"EDIT_BTN": "Edit User",
								"ARCHIVE_BTN": "Archive"
							}
						},
						"FORM": {
							"CONTROLS": {
								"ADD_FORM_PLACEHOLDER": "Select a form to add",
								"OPEN_BTN": "Open",
								"NEW_BTN": "Create Form",
								"EDIT_BTN": "Edit Form",
								"ARCHIVE_BTN": "Archive"
							}
						},
						"SURVEY": {
							"CONTROLS": {
								"OPEN_BTN": "View Survey",
								"NEW_BTN": "Add Survey",
								"EDIT_BTN": "Edit Survey",
								"ARCHIVE_BTN": "Archive"
							}
						}
					}
				},
				"COMMON": {
					"LANGUAGES": {
						"LANGUAGE": "Language",
						"ENGLISH": "English",
						"FRENCH": "French"
					},
					"HATEOAS": {
						"TITLE": {
							"TOTAL": "Total: {{total}}"
						},
						"QUERY": {
							"ADVANCED": {
								"SEARCH_BTN": "Advanced Search",
								"OPERATORS": {
									"NOT": "Not",
									"IS": "Is",
									"CONTAINS": "Contains",
									"LIKE": "Like",
									"STARTS_WITH": "Starts With",
									"ENDS_WITH": "Ends With"
								}
							},
							"PLACEHOLDER": "Search Value",
							"ADD_BTN": "Add",
							"RESET_BTN": "Reset"
						},
						"CONTROLS": {
							"OPEN_BTN": "Open",
							"NEW_BTN": "New",
							"EDIT_BTN": "Edit",
							"ARCHIVE_BTN": "Archive"
						}
					},
					"MODELS": {
						"STUDY": {
							"IDENTITY": "Study",
							"NAME": "Study Name",
							"ATTRIBUTES": "Attributes",
							"REB": "REB #",
							"ADMINISTRATOR": "Administrator",
							"PI": "PI"
						},
						"USER": {
							"IDENTITY": "User",
							"USERNAME": "Username",
							"EMAIL": "Email",
							"PREFIX": "Prefix",
							"FIRSTNAME": "Firstname",
							"LASTNAME": "Lastname",
							"GENDER": "Gender",
							"DOB": "Date of Birth"
						},
						"COLLECTION_CENTRE": {
							"IDENTITY": "Collection Centre",
							"NAME": "Collection Centre Name",
							"CONTACT": "Contact"
						},
						"SUBJECT_ENROLLMENT": {
							"IDENTITY": "Subject",
							"SUBJECT_NUMBER": "Subject ID",
							"COLLECTION_CENTRE": "@:COMMON.MODELS.COLLECTION_CENTRE.IDENTITY",
							"DOE": "Date of Event",
							"STUDY_MAPPING": "Study Mapping",
							"STATUS": "Status"
						},
						"USER_ENROLLMENT": {
							"IDENTITY": "User",
							"USERNAME": "Username",
							"EMAIL": "Email",
							"PREFIX": "Prefix",
							"FIRSTNAME": "Firstname",
							"LASTNAME": "Lastname",
							"GENDER": "Gender",
							"DOB": "Date of Birth",
							"COLLECTION_CENTRE": "@:COMMON.MODELS.COLLECTION_CENTRE.IDENTITY",
							"CENTRE_ACCESS": "Role"
						},
						"FORM": {
							"IDENTITY": "Form",
							"NAME": "Form Name",
							"METADATA": "Meta Data",
							"QUESTIONS": "Questions"
						},
						"SURVEY": {
							"IDENTITY": "Survey",
							"NAME": "Survey Name",
							"COMPLETED_BY": "Completed By"
						}
					}
				}
			},
			"fr": {
				"APP": {
					"AUTH": {
						"TITLE": "S'identifier",
						"USERNAME": "Nom d'utilisateur",
						"EMAIL": "Email",
						"USERNAME_OR_EMAIL": "Nom d'utilisateur ou email",
						"PASSWORD": "Mot de passe",
						"SIGN_IN": "S'inscrire",
						"SIGN_IN_ERROR": "Identifiant ou mot de passe incorrect"
					},
					"HEADER": {
						"TAGLINE": "Une plateforme ouverte pour collecte de données prospectives dans la recherche clinique et translationnelle",
						"SELECTED_STUDY": "Sélectionné Étude:",
						"MENU": {
							"STUDIES": "Etudes",
							"MY_STUDIES": "Mes études",
							"MY_PROFILE": "Mon profil",
							"USER_MANAGER": "Gestionnaire des Utilisateurs",
							"TOOLS": "Outils",
							"FORM_BUILDER": "Forme Constructeur",
							"WORKFLOW_EDITOR": "Travailler l'Editeur",
							"GROUPS": "Groupes",
							"TRANSLATIONS": "Traductions",
							"ACCESS_MANAGEMENT": "Gestion de L'acces"
						},
						"SUBMENU": {
							"OVERVIEW": "Vue d'ensemble",
							"COLLECTION_CENTRES": "Centres de Collecte",
							"SUBJECTS": "Matieres",
							"USERS": "Utilisateurs",
							"FORMS": "Formulaires",
							"SURVEYS": "Enquetes"
						}
					},
					"STUDY": {
						"OVERVIEW": {
							"TITLE": "Aperçu de L'étude: {{name}}",
							"ENROLLMENT": {
								"TITLE": "Enrôlement",
								"COLLECTION_CENTRES": "Centres de Collecte",
								"CONTACT": "Contact",
								"COORDINATORS": "Coordonnateurs",
								"INTERVIEWERS": "Intervieweurs",
								"SUBJECTS": "Sujets",
								"SUBJECTS_ENROLLED": "Sujets Inscrits"
							},
							"STUDY_INFORMATION": {
								"TITLE": "Informations D'étude"
							}
						},
						"SUBJECT": {
							"CONTROLS": {
								"OPEN_BTN": "Voir Sujet",
								"NEW_BTN": "Ajouter Sujet",
								"EDIT_BTN": "Modifier Sujet",
								"ARCHIVE_BTN": "Archiver"
							}
						},
						"USER": {
							"CONTROLS": {
								"SAVE_CHANGES": "Sauvegarder les Changements",
								"OPEN_BTN": "Voir Utilisateur",
								"NEW_BTN": "Ajouter Utilisateur",
								"EDIT_BTN": "Sauvegarder les Changements",
								"ARCHIVE_BTN": "Archiver"
							}
						},
						"FORM": {
							"CONTROLS": {
								"ADD_FORM_PLACEHOLDER": "Sélectionnez un formulaire pour ajouter",
								"NEW_BTN": "Créer Formulaire",
								"EDIT_BTN": "Modifier Formulaire",
								"ARCHIVE_BTN": "Archives"
							}
						},
						"SURVEY": {
							"CONTROLS": {
								"OPEN_BTN": "Voir Enquête",
								"NEW_BTN": "Ajouter Enquête",
								"EDIT_BTN": "Modifier Enquête",
								"ARCHIVE_BTN": "Archiver"
							}
						}
					}
				},
				"COMMON": {
					"LANGUAGES": {
						"LANGUAGE": "Langue",
						"ENGLISH": "Anglais",
						"FRENCH": "Francais"
					},
					"HATEOAS": {
						"TITLE": {
							"TOTAL": "Global: {{total}}"
						},
						"QUERY": {
							"ADVANCED": {
								"SEARCH_BTN": "Recherche Avancée",
								"OPERATORS": {
									"NOT": "Pas",
									"IS": "Est",
									"CONTAINS": "Contient",
									"LIKE": "Aimer",
									"STARTS_WITH": "Commence Avec",
									"ENDS_WITH": "Se Termine Par"
								}
							},
							"PLACEHOLDER": "Valeur de Recherche",
							"ADD_BTN": "Ajouter",
							"RESET_BTN": "Réinitialiser"
						},
						"CONTROLS": {
							"OPEN_BTN": "Ouvert",
							"NEW_BTN": "Nouveau",
							"EDIT_BTN": "Modifier",
							"ARCHIVE_BTN": "Archives"
						}
					},
					"MODELS": {
						"STUDY": {
							"IDENTITY": "Etude",
							"NAME": "Nom de L'étude",
							"ATTRIBUTES": "Attributs",
							"REB": "REB #",
							"ADMINISTRATOR": "Administrateur",
							"PI": "PI"
						},
						"USER": {
							"IDENTITY": "Utilisateur",
							"USERNAME": "Nom d'utilisateur",
							"EMAIL": "Email",
							"PREFIX": "Préfixe",
							"FIRSTNAME": "Prénom",
							"LASTNAME": "Nom de famille",
							"GENDER": "Sexe",
							"DOB": "Date D'anniversaire"
						},
						"COLLECTION_CENTRE": {
							"IDENTITY": "Centre Collection",
							"NAME": "Nom Collection Centre",
							"CONTACT": "Contact"
						},
						"SUBJECT_ENROLLMENT": {
							"IDENTITY": "Sujet",
							"SUBJECT_NUMBER": "Sujet ID",
							"COLLECTION_CENTRE": "Centre Collection",
							"DOE": "Date de L'événement",
							"STUDY_MAPPING": "Cartographie de L'étude",
							"STATUS": "Statut"
						},
						"USER_ENROLLMENT": {
							"IDENTITY": "Utilisateur",
							"USERNAME": "Nom d'utilisateur",
							"EMAIL": "Email",
							"PREFIX": "Préfixe",
							"FIRSTNAME": "Prénom",
							"LASTNAME": "Nom de famille",
							"GENDER": "Sexe",
							"DOB": "Date D'anniversaire",
							"COLLECTION_CENTRE": "Centre Collection",
							"CENTRE_ACCESS": "Rôle"
						},
						"FORM": {
							"IDENTITY": "Forme",
							"NAME": "Nom de Forme",
							"METADATA": "Métadonnées",
							"QUESTIONS": "Questions"
						},
						"SURVEY": {
							"IDENTITY": "Enquête",
							"NAME": "Nom de L'enquête",
							"COMPLETED_BY": "Terminé Par"
						}
					}
				}
			}
		};

		$scope.queries = [
			{
				label: 'Login Title',
				search: '//APP/AUTH/TITLE'
			},
			{
				label: 'Open Buttons',
				search: '//OPEN_BTN'
			},
			{
				label: 'Studies Menu',
				search: '//MENU/STUDIES'
			},
			{
				label: 'Model Identities',
				search: '//IDENTITY'
			}
		];

	}
})();
