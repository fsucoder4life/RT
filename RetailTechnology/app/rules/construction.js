/**
 * Define's a set of functions that you can pass a store to and return an object with the following:
 *  severity: (integer) with 0 being that the task is either complete or require's no warning, or 1, 2, 3 to represent levels of warning recomended
 *              returns -1 for an error - missing field or other issue
 *  description: a text description of the business rule including the parameters
 *  title: A short description of the business rule
 *  category: A category for a rule so issues can be summarized
 */

var passedPosHardwareSoftwareCost = false; //failed
var passedPosProServicesSupportCost = false; //failed
var passedPopsStatus = false; //failed
var passedAudioStatus = false; //failed
var passedCirronetStatus = false; //failed
var passedDmbTvStatus = false; //failed
var passedSonicRadioStatus = false; //failed
var passedProjectStatus = false; //failed

define(['app/store/construction', 'app/store/combined'], function (construction, combined) {
    var rules = [
    /**************Installer Related Rules**************/
    {
        field: 'PosHardwareSoftwareCost',
        category: 'CostTool',
        test: function (store) {
            if (store.PosStatus === 'Not Required') {
                passedPosHardwareSoftwareCost = true;
                return { severity: 1, description: '' };
            }

            if (store.PosHardwareSoftwareCost !== '' && store.PosHardwareSoftwareCost !== '0' && typeof store.PosHardwareSoftwareCost !== 'undefined') {
                passedPosHardwareSoftwareCost = true;
                return {
                    severity: 0, description: ''
                };
            }

            var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
              goLive = moment(store.GoLiveDate);

            if (today.diff(goLive, 'days') >= 30) {

                if (store.PosHardwareSoftwareCost === '' || store.PosHardwareSoftwareCost === '0' || typeof store.PosHardwareSoftwareCost === 'undefined') {
                    return {
                        severity: 3, description: 'Critical: Missing cost 30 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else if (today.diff(goLive, 'days') >= 15) {

                if (store.PosHardwareSoftwareCost === '' || store.PosHardwareSoftwareCost === '0' || typeof store.PosHardwareSoftwareCost === 'undefined') {
                    return {
                        severity: 2, description: 'Warning: Missing cost 15 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else
                return { severity: 1, description: '' };

        }
    },
    {
        field: 'PosProServicesSupportCost',
        category: 'CostTool',
        test: function (store) {
            if (store.PosStatus === 'Not Required') {
                passedPosProServicesSupportCost = true;
                return { severity: 1, description: '' };
            }

            if (store.PosProServicesSupportCost !== '' && store.PosProServicesSupportCost !== '0' && typeof store.PosProServicesSupportCost !== 'undefined') {
                passedPosProServicesSupportCost = true;
                return {
                    severity: 0, description: ''
                };
            }

            var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
              goLive = moment(store.GoLiveDate);

            if (today.diff(goLive, 'days') >= 30) {

                if (store.PosProServicesSupportCost === '' || store.PosProServicesSupportCost === '0' || typeof store.PosProServicesSupportCost === 'undefined') {
                    return {
                        severity: 3, description: 'Critical: Missing cost 30 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else if (today.diff(goLive, 'days') >= 15) {

                if (store.PosProServicesSupportCost === '' || store.PosProServicesSupportCost === '0' || typeof store.PosProServicesSupportCost === 'undefined') {
                    return {
                        severity: 2, description: 'Warning: Missing cost 15 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else
                return { severity: 1, description: '' };

        }
    },
    {
        field: 'FABCONCost',
        category: 'CostTool',
        test: function (store) {
            //console.log("FABCONCost test1");
            if (store.PopsStatus === 'Not Required') {
                passedPopsStatus = true;
                return { severity: 1, description: '' };
            }
            //console.log("FABCONCost test2");
            if (store.FABCONCost !== '' && store.FABCONCost !== '0' && typeof store.FABCONCost !== 'undefined') {
                passedPopsStatus = true;
                return {
                    severity: 0, description: ''
                };
            }
            //console.log("FABCONCost test3");
            var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
              goLive = moment(store.GoLiveDate);

            if (today.diff(goLive, 'days') >= 30) {

                if (store.FABCONCost === '' || store.FABCONCost === '0' || typeof store.FABCONCost === 'undefined') {
                    return {
                        severity: 3, description: 'Critical: Missing cost 30 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else if (today.diff(goLive, 'days') >= 15) {

                if (store.FABCONCost === '' || store.FABCONCost === '0' || typeof store.FABCONCost === 'undefined') {
                    return {
                        severity: 2, description: 'Warning: Missing cost 15 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else
                return { severity: 1, description: '' };

        }
    },
    {
        field: 'IDTECHCost',
        category: 'CostTool',
        test: function (store) {
            //console.log("IDTECHCost test1");
            if (store.PopsStatus === 'Not Required') {
                passedPopsStatus = true;
                return { severity: 1, description: '' };
            }
            //console.log("IDTECHCost test2");
            if (store.IDTECHCost !== '' && store.IDTECHCost !== '0' && typeof store.IDTECHCost !== 'undefined') {
                passedPopsStatus = true;
                return {
                    severity: 0, description: ''
                };
            }
            //console.log("IDTECHCost test3");
            var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
              goLive = moment(store.GoLiveDate);

            if (today.diff(goLive, 'days') >= 30) {

                if (store.IDTECHCost === '' || store.IDTECHCost === '0' || typeof store.IDTECHCost === 'undefined') {
                    return {
                        severity: 3, description: 'Critical: Missing cost 30 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else if (today.diff(goLive, 'days') >= 15) {

                if (store.IDTECHCost === '' || store.IDTECHCost === '0' || typeof store.IDTECHCost === 'undefined') {
                    return {
                        severity: 2, description: 'Warning: Missing cost 15 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else
                return { severity: 1, description: '' };

        }
    },
    {
        field: 'AudioCost',
        category: 'CostTool',
        test: function (store) {
            if (store.AudioStatus === 'Not Required') {
                passedAudioStatus = true;
                return { severity: 1, description: '' };
            }

            if (store.AudioCost !== '' && store.AudioCost !== '0' && typeof store.AudioCost !== 'undefined') {
                passedAudioStatus = true;
                return {
                    severity: 0, description: ''
                };
            }

            var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
              goLive = moment(store.GoLiveDate);

            if (today.diff(goLive, 'days') >= 30) {

                if (store.AudioCost === '' || store.AudioCost === '0' || typeof store.AudioCost === 'undefined') {
                    return {
                        severity: 3, description: 'Critical: Missing cost 30 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else if (today.diff(goLive, 'days') >= 15) {

                if (store.AudioCost === '' || store.AudioCost === '0' || typeof store.AudioCost === 'undefined') {
                    return {
                        severity: 2, description: 'Warning: Missing cost 15 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else
                return { severity: 1, description: '' };

        }
    },

    {
        field: 'PaysCost',
        category: 'CostTool',
        test: function (store) {
            if (store.CirronetStatus === 'Not Required') {
                passedCirronetStatus = true;
                return { severity: 1, description: '' };
            }

            if (store.PaysCost !== '' && store.PaysCost !== '0' && typeof store.PaysCost !== 'undefined') {
                passedCirronetStatus = true;
                return {
                    severity: 0, description: ''
                };
            }

            var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
              goLive = moment(store.GoLiveDate);

            if (today.diff(goLive, 'days') >= 30) {

                if (store.PaysCost === '' || store.PaysCost === '0' || typeof store.PaysCost === 'undefined') {
                    return {
                        severity: 3, description: 'Critical: Missing cost 30 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else if (today.diff(goLive, 'days') >= 15) {

                if (store.PaysCost === '' || store.PaysCost === '0' || typeof store.PaysCost === 'undefined') {
                    return {
                        severity: 2, description: 'Warning: Missing cost 15 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else
                return { severity: 1, description: '' };

        }
    },

    {
        field: 'DmbCost',
        category: 'CostTool',
        test: function (store) {
            if (store.DmbTvStatus === 'Not Required') {
                passedDmbTvStatus = true;
                return { severity: 1, description: '' };
            }

            if (store.DmbCost !== '' && store.DmbCost !== '0' && typeof store.DmbCost !== 'undefined') {
                passedDmbTvStatus = true;
                return {
                    severity: 0, description: ''
                };
            }

            var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
              goLive = moment(store.GoLiveDate);

            if (today.diff(goLive, 'days') >= 30) {

                if (store.DmbCost === '' || store.DmbCost === '0' || typeof store.DmbCost === 'undefined') {
                    return {
                        severity: 3, description: 'Critical: Missing cost 30 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else if (today.diff(goLive, 'days') >= 15) {

                if (store.DmbCost === '' || store.DmbCost === '0' || typeof store.DmbCost === 'undefined') {
                    return {
                        severity: 2, description: 'Warning: Missing cost 15 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else
                return { severity: 1, description: '' };

        }
    },

    {
        field: 'SonicRadioCost',
        category: 'CostTool',
        test: function (store) {
            if (store.SonicRadioStatus === 'Not Required') {
                passedSonicRadioStatus = true;
                return { severity: 1, description: '' };
            }

            if (store.SonicRadioCost !== '' && store.SonicRadioCost !== '0' && typeof store.SonicRadioCost !== 'undefined') {
                passedSonicRadioStatus = true;
                return {
                    severity: 0, description: ''
                };
            }

            var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
              goLive = moment(store.GoLiveDate);

            if (today.diff(goLive, 'days') >= 30) {

                if (store.SonicRadioCost === '' || store.SonicRadioCost === '0' || typeof store.SonicRadioCost === 'undefined') {
                    return {
                        severity: 3, description: 'Critical: Missing cost 30 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else if (today.diff(goLive, 'days') >= 15) {

                if (store.SonicRadioCost === '' || store.SonicRadioCost === '0' || typeof store.SonicRadioCost === 'undefined') {
                    return {
                        severity: 2, description: 'Warning: Missing cost 15 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else
                return { severity: 1, description: '' };

        }
    },

    {
        field: 'InstallationCost',
        category: 'CostTool',
        test: function (store) {
            if (store.ProjectStatus === 'Not Required') {
                passedProjectStatus = true;
                return { severity: 1, description: '' };
            }

            if (store.InstallationCost !== '' && store.InstallationCost !== '0' && typeof store.InstallationCost !== 'undefined') {
                passedProjectStatus = true;
                return {
                    severity: 0, description: ''
                };
            }

            var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
              goLive = moment(store.GoLiveDate);

            if (today.diff(goLive, 'days') >= 30) {

                if (store.InstallationCost === '' || store.InstallationCost === '0' || typeof store.InstallationCost === 'undefined') {
                    return {
                        severity: 3, description: 'Critical: Missing cost 30 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else if (today.diff(goLive, 'days') >= 15) {

                if (store.InstallationCost === '' || store.InstallationCost === '0' || typeof store.InstallationCost === 'undefined') {
                    return {
                        severity: 2, description: 'Warning: Missing cost 15 days after go-live'
                    };
                }
                else
                    return { severity: 0, description: '' };
            }
            else
                return { severity: 1, description: '' };

        }
    },


    {
        field: 'StoreConfigurationCost',
        category: 'CostTool',
        test: function (store) {
            if (passedPosHardwareSoftwareCost && passedPosProServicesSupportCost && passedPopsStatus && passedAudioStatus && passedCirronetStatus && passedDmbTvStatus && passedSonicRadioStatus && passedProjectStatus)
                {
                //console.log('test pass' + store.FABCONCost);
                return { severity: 0, description: '' };
            }
        else {
                //console.log('test fail' + store.FABCONCost);
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
              goLive = moment(store.GoLiveDate);

                if (today.diff(goLive, 'days') >= 30) {
                    return { severity: 1, description: '' };
                    //return {
                    //    severity: 3, description: 'Critical: Missing cost 30 days after go-live'
                    //};
                }
                else if (today.diff(goLive, 'days') >= 15) {
                    return { severity: 1, description: '' };
                    //return {
                    //    severity: 2, description: 'Warning: Missing cost 15 days after go-live'
                    //};
                }
                else {
                    return { severity: 1, description: '' };
                }
                
            }
        }
    },


      {
          field: 'PhotoCount',
          category: 'InstallerScoreCard',
          test: function (store) {
              //Check to see if PhotoCount is above 10
              if (typeof store.PhotoCount === 'undefined' || store.PhotoCount === 0) {
                  return { severity: 3, description: 'Critical: No install photos' };
              } else if (store.PhotoCount < 10) {
                  return { severity: 2, description: 'Warning: Less than 10 total install photos' }
              } else {
                  return { severity: 0, description: '' }
              }
          }
      },
      {
          field: 'UpdateCount',
          category: 'InstallerScoreCard',
          test: function (store) {
              //Check to see if PhotoCount is above 10
              if (typeof store.UpdateCount === 'undefined' || store.UpdateCount === 0) {
                  return { severity: 3, description: 'Critical: No install updates submitted' };
              }

              //Check the install duration
              if (store.InstallEndDate === '' || store.InstallDate === '') {
                  return { severity: 2, description: 'Critical: Missing Install Start/End data' };
              } else {
                  var duration = moment(store.InstallEndDate).diff(moment(store.InstallDate), 'days') + 1;

                  if (store.UpdateCount >= duration || store.UpdateCount > 5) {
                      return { severity: 0, description: '' }
                  } else if (store.UpdateCount > 0) {
                      return { severity: 2, description: 'Warning: Updates not sent in for each day' }
                  }

                  return { severity: 3, description: 'Critical: No updates submitted' }
              }
          }
      },
      {
          field: 'InstallDuration',
          category: 'InstallerScoreCard',
          test: function (store) {
              //Check to see if Duration is above 5
              if (store.InstallEndDate === '' || store.InstallDate === '') {
                  return { severity: 2, description: 'Warning: Missing Install Start/End data' };
              } else {
                  var duration = moment(store.InstallEndDate).diff(moment(store.InstallDate), 'days') + 1;

                  if (duration <= 5) {
                      return { severity: 0, description: '' };
                  } else if (duration > 5 && duration < 10) {
                      return { severity: 2, description: 'Warning: Install took 6-9 days' }
                  } else {
                      return { severity: 3, description: 'Critical: Install took 10+ days' }
                  }
              }
          }
      },
      {
          field: 'SignoffDate',
          category: 'Installer',
          test: function (store) {
              var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                goLive = moment(store.GoLiveDate);

              //Confirm install end and signoff dates
              if (store.SingoffDate === '') {
                  if (today.diff(goLive, 'days') >= 0) return { severity: 3, description: 'Warning: Missing Signoff Date after go-live' };
                  if (today.diff(install, 'days') > 4) return { severity: 2, description: 'Warning: Missing Signoff Date 5 or more days after install' };
                  return { severity: 1, description: '' };
              }
              //Check to see if Duration is above 5
              if (store.InstallEndDate === '') {
                  if (today.diff(goLive, 'days') >= 0) return { severity: 3, description: 'Warning: Missing Install End Date after go-live' };
                  if (today.diff(install, 'days') > 4) return { severity: 2, description: 'Warning: Missing Install End Date 5 or more days after install' };
                  return { severity: 1, description: '' };
              }

              var duration = moment(store.SignoffDate).startOf('day').diff(moment(store.InstallEndDate).startOf('day'), 'days');

              if (duration <= 1) {
                  return { severity: 0, description: '' };
              } else if (duration === 2) {
                  return { severity: 2, description: 'Warning: Signoffs submitted more than 24 hours after install completion' }
              } else {
                  return { severity: 3, description: 'Critical: Singoffs submitted more than two days after install completion' }
              }
          }
      },
      {
          field: 'TestTransactionStatus',
          category: 'Installer',
          test: function (store) {
              var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                goLive = moment(store.GoLiveDate),
                target;

              if (store.TestTransactionStatus) {
                  if (store.TestTransactionStatus.toUpperCase().indexOf('YES') === 0) {
                      return { severity: 0, description: '' };
                  }
                  if (store.TestTransactionStatus.toUpperCase().indexOf('PARTIAL') === 0) {
                      return { severity: 2, description: 'Warning: Full test transactions not completed' };
                  }
              }

              if (store.OvernightInstall) {
                  if (store.OvernightInstall === '' || store.OvernightInstall.toUpperCase().indexOf('DAYTIME')) {
                      //Rules for daytime installs
                      target = install.add(4, 'days');
                  } else {
                      //Rules for daytime installs
                      target = goLive;
                  }
              }

              if (today.diff(target, 'days') < 0)
                  return { severity: 1, description: '' };

              if (store.TestTransactionStatus) {
                  if (today.diff(target, 'days') > 2 && store.TestTransactionStatus.toUpperCase().indexOf('SUBMITTED') !== 0)
                      return { severity: 3, description: 'Critical: Install signoffs are past due' };
                  if (today.diff(target, 'days') <= 2 && store.TestTransactionStatus.toUpperCase().indexOf('SUBMITTED') !== 0)
                      return { severity: 2, description: 'Warning: Install signoffs not returned after install is complete' };
                  if (today.diff(target, 'days') === 0 && store.TestTransactionStatus.toUpperCase().indexOf('SUBMITTED') !== 0)
                      return { severity: 2, description: 'Warning: Today is last day of install, need signoffs back by end of day' };
              }
              return { severity: 1, description: '' };
          }
      },
        {
            field: 'Installer',
            category: 'Installer',
            test: function (store) {
                //Check to see if installer is assigned
                if (store.Installer === '' || typeof store.Installer === 'undefined') {
                    //Estimate the install date if it is not set
                    var install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate));

                    //Check to see how far from the install date we are
                    var today = moment().set('hour', 0).set('minute', 0).set('second', 0);
                    if (install.diff(today, 'days') <= 30) return { severity: 3, description: 'Critical: Installer not assigned within 30 days of opening' };
                    if (install.diff(today, 'days') <= 60) return { severity: 2, description: 'Warning: Installer not assigned within 60 days of opening' };
                    return { severity: 1, description: '' };
                } else {
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'InstallDate',
            category: 'Installer',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    goLive = moment(store.GoLiveDate);

                //Check to see if install date is set
                if (store.InstallDate === '') {
                    if (goLive.diff(today, 'days') <= 30) return { severity: 3, description: 'Critical: Install date not set within 30 days of opening' };
                    if (goLive.diff(today, 'days') <= 60) return { severity: 2, description: 'Warning: Install date not set within 60 days of opening' };
                    return { severity: 1, description: '' };
                } else {
                    //Check to see if the install is at least 5 days before the opening (and in general before the opening)
                    var install = moment(store.InstallDate);

                    if (goLive.diff(install, 'days') <= 0) return { severity: 3, description: 'Critical: Install date on or after opening date' };
                    if (goLive.diff(install, 'days') < 5) return { severity: 2, description: 'Warning: Install date less than 5 days from opening date' };
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'InstallEndDate',
            category: 'Installer',
            test: function (store) {
                //If it is set, then we're good
                if (store.InstallEndDate !== '') {
                    return { severity: 1, description: '' };
                }

                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                  install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                  goLive = moment(store.GoLiveDate);

                //Check to see if install end date is set
                if (store.InstallEndDate === '') {
                    if (today.diff(goLive, 'days') >= 0) return { severity: 3, description: 'Critical: Install End Date not set on or after the opening' };
                    if (today.diff(install, 'days') > 4) return { severity: 2, description: 'Warning: Install End Date not set 5 days after install' };
                }

                return { severity: 1, description: '' };
            }
        },
        {
            field: 'InstallationStatus',
            category: 'Installer',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    goLive = store.GoLiveDate;

                //Check Completion
                if (store.InstallationStatus) {
                    if (store.InstallationStatus.toUpperCase().indexOf('COMPLETE') === 0)
                        return { severity: 0, description: '' };
                    //Check Contract Completion
                    if (install.diff(today, 'days') <= 15 && !contains(store.InstallationStatus, ['contract complete', 'complete']))
                        return { severity: 3, description: 'Critical: Installer contract not complete within 15 days of installation' };
                    if (install.diff(today, 'days') <= 30 && !contains(store.InstallationStatus, ['contract complete', 'complete']))
                        return { severity: 2, description: 'Critical: Installer contract not complete within 30 days of installation' };
                    //Check for quote issued
                    if (install.diff(today, 'days') <= 45 && !contains(store.InstallationStatus, ['quote to fee', 'signature', 'deposit', 'contract complete', 'complete']))
                        return { severity: 2, description: 'Warning: Installer quote not provided to franchisee within 45 days of installation' };
                }
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'InstallSignoffStatus',
            category: 'Installer',
            test: function (store) {

                try {

                    var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                        install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                        goLive = moment(store.GoLiveDate),
                        target;

                    if (InstallSignoffStatus) {
                        if (store.InstallSignoffStatus.toUpperCase().indexOf('SUBMITTED') === 0) {
                            return { severity: 0, description: '' };
                        }

                        if (store.InstallSignoffStatus.toUpperCase().indexOf('NEEDS PM REVIEW') === 0) {
                            return { severity: 2, description: 'Warning: PM Needs to Review, follow up on issues, and mark complete.' };
                        }

                        if (store.OvernightInstall === '' || store.OvernightInstall.toUpperCase().indexOf('DAYTIME')) {
                            //Rules for daytime installs
                            target = install.add(4, 'days');
                        }
                        else {
                            //Rules for daytime installs
                            target = goLive;
                        }
                    }
                    else {
                        //Rules for daytime installs
                        target = goLive;
                    }

                    if (today.diff(target, 'days') < 0)
                        return { severity: 1, description: '' };

                    if (store.InstallSignoffStatus) {
                        if (today.diff(target, 'days') > 2 && store.InstallSignoffStatus.toUpperCase().indexOf('SUBMITTED') !== 0)
                            return { severity: 3, description: 'Critical: Install signoffs are past due' };
                        if (today.diff(target, 'days') <= 2 && store.InstallSignoffStatus.toUpperCase().indexOf('SUBMITTED') !== 0)
                            return { severity: 2, description: 'Warning: Install signoffs not returned after install is complete' };
                        if (today.diff(target, 'days') === 0 && store.InstallSignoffStatus.toUpperCase().indexOf('SUBMITTED') !== 0)
                            return { severity: 2, description: 'Warning: Today is last day of install, need signoffs back by end of day' };
                    }
                    return { severity: 1, description: '' };
                }
                catch (err) {
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'OvernightInstall',
            category: 'Installer',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    goLive = moment(store.GoLiveDate);

                //Check Contract Completion
                if (install.diff(today, 'days') <= 28 && store.OvernightInstall === '')
                    return { severity: 3, description: 'Critical: Install time (day/night) has not be indicated within 4 weeks of install' };
                if (install.diff(today, 'days') <= 56 && store.OvernightInstall === '')
                    return { severity: 2, description: 'Warning: Install time (day/night) has not be indicated within 8 weeks of install' };

                return { severity: 1, description: '' };
            }
        },
        {
            field: 'ProjectStatus',
            category: 'Installer',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    goLive = moment(store.GoLiveDate);

                //Check Completion
                if (store.ProjectStatus) {
                    if (store.ProjectStatus.toUpperCase().indexOf('COMPLETE') === 0)
                        return { severity: 1, description: '' };

                    //Check time from go-live
                    if (goLive.diff(today, 'days') <= 0 && !contains(store.ProjectStatus, ['complete']))
                        return { severity: 3, description: 'Critical: Store not complete by go-live' };
                    //Check time from install
                    if (install.diff(today, 'days') <= -5 && !contains(store.ProjectStatus, ['complete']))
                        return { severity: 2, description: 'Critical: Store not complete by 5 days after install' };
                }
                return { severity: 1, description: '' };
            }
        },
    /**************POS Related Rules**************/
        {
            field: 'Pos',
            category: 'POS',
            test: function (store) {
                //Check to see if pos type is selected and not undecided
                if (store.Pos) {
                    if (store.Pos === '' || store.Pos.toUpperCase().indexOf('UNDECIDED') !== -1 || store.Pos.toUpperCase().indexOf('UNKNOWN') !== -1) {
                        //Estimate the install date if it is not set
                        var install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate));

                        //Check to see how far from the install date we are
                        var today = moment().set('hour', 0).set('minute', 0).set('second', 0);
                        if (install.diff(today, 'days') <= 30) return { severity: 3, description: 'Critical: POS not selected within 30 days of opening' };
                        if (install.diff(today, 'days') <= 60) return { severity: 2, description: 'Warning: POS not selected within 60 days of opening' };
                        return { severity: 1, description: '' };
                    } else {
                        return { severity: 1, description: '' };
                    }
                }
                else {
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'PosDeliveryDate',
            category: 'POS',
            test: function (store) {
                if (contains(store.PosStatus, 'not required'))
                    return { severity: 1, description: '' };
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate));

                if (contains(store.PosStatus, 'delivered') || contains(store.PosStatus, 'not required'))
                    return { severity: 0, description: '' };

                //Check to see if delivery date is set
                if (store.PosDeliveryDate === '') {
                    if (install.diff(today, 'days') <= 45) return { severity: 3, description: 'Critical: POS delivery date not set within 45 days of install' };
                    if (install.diff(today, 'days') <= 60) return { severity: 2, description: 'Warning: POS delivery date not set within 60 days of install' };
                    return { severity: 1, description: '' };
                } else {
                    //Check to see if the install is at least 5 days before the opening (and in general before the opening)
                    var delivery = moment(store.PosDeliveryDate);
                    var shipped = contains(store.PosStatus, ['shipped', 'delivered'])

                    if (install.diff(delivery, 'days') < 0 && !shipped) return { severity: 3, description: 'Critical: POS delivery date after install date' };
                    if (install.diff(delivery, 'days') === 0 && !shipped) return { severity: 2, description: 'Warning: POS delivery on same day as install date' };
                    if (install.diff(delivery, 'days') >= 10 && !shipped) return { severity: 3, description: 'Critical: POS delivery 10 days or more before install date' };
                    if (install.diff(delivery, 'days') >= 5 && !shipped) return { severity: 2, description: 'Warning: POS delivery 5 days or more before install date' };
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'PosStatus',
            category: 'POS',
            test: function (store) {

                if (contains(store.PosStatus, 'not required'))
                    return { severity: 1, description: '' };

                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    delivery = (store.PosDeliveryDate === '' ? install.add(-2, 'days') : moment(store.PosDeliveryDate));

                //Fix today to

                if (contains(store.PosStatus, 'delivered') || contains(store.PosStatus, 'not required'))
                    return { severity: 0, description: '' };

                //Check delivery
                if (delivery.diff(today, 'days') <= 0 && !contains(store.PosStatus, 'delivered'))
                    return { severity: 3, description: 'Critical: POS not delivered by delivery date' };
                //Check Shipping
                if (delivery.diff(today, 'days') <= 5 && !contains(store.PosStatus, ['shipped', 'delivered']))
                    return { severity: 3, description: 'Critical: POS not shipped within 5 days of delivery target' };
                if (delivery.diff(today, 'days') <= 10 && !contains(store.PosStatus, ['shipped', 'shipping', 'delivered']))
                    return { severity: 2, description: 'Warning: POS not shipped within 10 days of delivery target' };
                //Check Contract Completion
                if (delivery.diff(today, 'days') <= 15 && !contains(store.PosStatus, ['contract complete', 'shipped', 'shipping', 'delivered']))
                    return { severity: 3, description: 'Critical: POS contract not complete within 15 days of delivery target' };
                if (delivery.diff(today, 'days') <= 30 && !contains(store.PosStatus, ['contract complete', 'shipped', 'shipping', 'delivered']))
                    return { severity: 2, description: 'Critical: POS contract not complete within 30 days of delivery target' };
                //Check for quote issued
                if (delivery.diff(today, 'days') <= 45 && !contains(store.PosStatus, ['quote to fee', 'need signature', 'need deposit', 'contract complete', 'shipped', 'shipping', 'delivered']))
                    return { severity: 2, description: 'Critical: POS quote not provided to franchisee within 45 days of delivery target' };

                return { severity: 1, description: '' };
            }
        },
        {
            field: 'PosConfigDate',
            category: 'POS',
            test: function (store) {
                if (contains(store.PosStatus, 'not required'))
                    return { severity: 1, description: '' };
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate));

                //Check to see if date is set
                if (store.PosConfigDate === '' && contains(store.Pos, 'micros')) {
                    if (install.diff(today, 'days') <= 15) return { severity: 3, description: 'Critical: POS CAL date not set within 15 days of install' };
                    if (install.diff(today, 'days') <= 30) return { severity: 3, description: 'Warning: POS CAL date not set within 30 days of install' };
                } else if (contains(store.Pos, 'micros')) {
                    //Check to see if the CAL date is 3-5 days after install
                    var cal = moment(store.PosConfigDate);

                    if (cal.diff(install, 'days') < 2) return { severity: 2, description: 'Warning: CAL date before third day of install - installation may not be complete' };   //note - counts first day as a full day, so day after = 2 days, 2 days after = 3 days, etc
                    if (cal.diff(install, 'days') > 5) return { severity: 2, description: 'Warning: CAL date after 5th day of install - installers will likely not be onsite' };
                    return { severity: 1, description: '' };
                }
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'PosVendorSupportDate',
            category: 'POS',
            test: function (store) {
                if (contains(store.PosStatus, 'not required'))
                    return { severity: 1, description: '' };
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    goLive = moment(store.GoLiveDate);

                //Check to see if date is set
                if (store.PosVendorSupportDate === '') {
                    if (install.diff(today, 'days') <= 15) return { severity: 3, description: 'Critical: POS support date not set within 15 days of install' };
                    if (install.diff(today, 'days') <= 30) return { severity: 3, description: 'Warning: POS support date not set within 30 days of install' };
                } else if (contains(store.Pos, 'micros')) {
                    //Check to see if the CAL date is 3-5 days after install
                    var support = moment(store.PosVendorSupportDate);

                    if (goLive.diff(support, 'days') < 0) return { severity: 3, description: 'Critical: POS support date after opening' };
                    if (goLive.diff(support, 'days') > 5) return { severity: 3, description: 'Critical: POS support date more than five days before opening' };
                    if (goLive.diff(support, 'days') > 3) return { severity: 3, description: 'Warning: POS support date more than three days before opening' };
                    return { severity: 1, description: '' };
                }
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'EnterpriseManagementStatus',
            category: 'POS',
            test: function (store) {
                if (contains(store.PosStatus, 'not required'))
                    return { severity: 1, description: '' };
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    cal = (store.PosConfigDate === '' ? install.add(4, 'days') : moment(store.PosConfigDate));

                if (contains(store.Pos, 'micros')) {
                    //Check completion
                    if (cal.diff(today, 'days') <= 14 && !contains(store.EnterpriseManagementStatus, 'complete'))
                        return { severity: 3, description: 'Critical: EM Not Complete withing 2 weeks of CAL date' };

                    //Check submission of EM surveys
                    if (cal.diff(today, 'days') <= 28 && !contains(store.EnterpriseManagementStatus, ['Sent to EM', 'EM Received', 'pricing', 'QA', 'finalizing', 'complete']))
                        return { severity: 3, description: 'Critical: Surveys not submitted to EM within 4 weeks of CAL date' };
                    if (cal.diff(today, 'days') <= 42 && !contains(store.EnterpriseManagementStatus, ['Sent to EM', 'EM Received', 'pricing', 'QA', 'finalizing', 'complete']))
                        return { severity: 2, description: 'Warning: Surveys not submitted to EM within 6 weeks of CAL date' };

                    //Check that surveys were sent
                    if (cal.diff(today, 'days') <= 56 && !contains(store.EnterpriseManagementStatus, ['Sent to FEE', 'Sent to EM', 'EM Received', 'pricing', 'QA', 'finalizing', 'complete']))
                        return { severity: 2, description: 'Warning: Surveys not sent to franchisee withing 8 weeks of CAL date' };
                } else {
                    //Check completion/submission
                    if (install.diff(today, 'days') <= 14 && !contains(store.EnterpriseManagementStatus, 'complete'))
                        return { severity: 3, description: 'Critical: Questionnaire Not Complete withing 2 weeks of install date' };
                    if (install.diff(today, 'days') <= 42 && !contains(store.EnterpriseManagementStatus, 'complete'))
                        return { severity: 2, description: 'Critical: Questionnaire Not Complete withing 6 weeks of install date' };

                    //Check that surveys were sent

                    if (install.diff(today, 'days') <= 56 && !contains(store.EnterpriseManagementStatus, ['Sent to FEE', 'Need Questionnaire', 'Need Pricing', 'Need Stall Layout', 'complete']))
                        return { severity: 2, description: 'Critical: Questionnaire Not sent withing 8 weeks of install date' };
                }

                return { severity: 1, description: '' };
            }
        },
    /**************POPS Related Rules**************/
        {
            field: 'PopsDeliveryDate',
            category: 'POPS',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    notice = '';


                //Estimate missing delivery date
                if (store.PopsDeliveryDate === '') {
                    delivery = install.add(-2, 'days');
                    notice += "\r\nDelivery Date estimated at 2 days before install";
                }

                //Check to see if delivery date is set
                if (store.PopsDeliveryDate === '') {
                    if (install.diff(today, 'days') <= 30) return { severity: 3, description: 'Critical: POPS delivery date not set within 30 days of install' + notice };
                    if (install.diff(today, 'days') <= 45) return { severity: 2, description: 'Warning: POPS delivery date not set within 45 days of install' + notice };
                    return { severity: 1, description: '' };
                } else {
                    //Check to see if the install is at least 5 days before the opening (and in general before the opening)
                    var delivery = moment(store.PopsDeliveryDate);
                    var shipped = contains(store.PopsStatus, ['shipped', 'delivered']);

                    if (install.diff(delivery, 'days') < 0 && !shipped) return { severity: 3, description: 'Critical: POPS delivery date after install date' + notice };
                    if (install.diff(delivery, 'days') === 0 && !shipped) return { severity: 2, description: 'Warning: POPS delivery on same day as install date' + notice };
                    if (install.diff(delivery, 'days') >= 10 && !shipped) return { severity: 3, description: 'Critical: POPS delivery 10 days or more before install date' + notice };
                    if (install.diff(delivery, 'days') >= 5 && !shipped) return { severity: 2, description: 'Warning: POPS delivery 5 days or more before install date' + notice };
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'PopsStatus',
            category: 'POPS',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = moment(store.InstallDate),
                    delivery = moment(store.PopsDeliveryDate),
                    notice = '';

                if (contains(store.PopsStatus, 'not required'))
                    return { severity: 1, description: '' };
                if (contains(store.PopsStatus, 'delivered'))
                    return { severity: 0, description: '' };

                //Estimate missing Install Date
                if (store.InstallDate === '') {
                    install = moment(store.GoLiveDate).add(-10, 'days');
                    notice += "\r\nInstall Date estimated at 10 days before go-live";
                }
                //Estimate missing delivery date
                if (store.PopsDeliveryDate === '') {
                    delivery = install.add(-2, 'days');
                    notice += "\r\nDelivery Date estimated at 2 days before install";
                }

                //Check Credit Doc to FEE or Need Payment
                if (delivery.diff(today, 'days') <= 30 && contains(store.PopsStatus, ['credit doc to fee', 'credit doc to fabcon', 'need payment']))
                    return { severity: 3, description: 'Critical: POPS status within 30 days of delivery target' + notice };
                if (delivery.diff(today, 'days') <= 60 && contains(store.PopsStatus, ['credit doc to fee', 'credit doc to fabcon', 'need payment']))
                    return { severity: 2, description: 'Warning: POPS status within 60 days of delivery target' + notice };

                //Check delivery
                if (delivery.diff(today, 'days') <= 0 && !contains(store.PopsStatus, 'delivered'))
                    return { severity: 3, description: 'Critical: POPS not delivered by delivery date' + notice };
                //Check Shipping
                if (delivery.diff(today, 'days') <= 5 && !contains(store.PopsStatus, ['shipped', 'delivered']))
                    return { severity: 3, description: 'Critical: POPS not shipped within 5 days of delivery target' + notice };
                if (delivery.diff(today, 'days') <= 10 && !contains(store.PopsStatus, ['shipped', 'delivered']))
                    return { severity: 2, description: 'Warning: POPS not shipped within 10 days of delivery target' + notice };
                //Check PO Issued
                if (delivery.diff(today, 'days') <= 15 && !contains(store.PopsStatus, ['po issued', 'shipped', 'delivered']))
                    return { severity: 3, description: 'Critical: POPS PO not issued within 15 days of delivery target' + notice };
                if (delivery.diff(today, 'days') <= 30 && !contains(store.PopsStatus, ['po issued', 'shipped', 'delivered']))
                    return { severity: 2, description: 'Critical: POPS PO not issued within 30 days of delivery target' + notice };
                //Check for order auth sent to FEE (Need Signature Status)
                if (delivery.diff(today, 'days') <= 45 && !contains(store.PopsStatus, ['estimate to fee', 'need signature', 'po issued', 'shipped', 'delivered']))
                    return { severity: 2, description: 'Critical: POPS order auth not provided to franchisee within 45 days of delivery target' + notice };


                return { severity: 1, description: '' };
            }
        },
        {
            field: 'DtPopsBaseDeliveryDate',
            category: 'POPS',
            test: function (store) {
                if (contains(store.DtPopsBaseStatus, ['not required', 'delivered']) || store.DriveThruFormat === 'No') {
                    return { severity: 1, description: '' };
                }

                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    notice = '';


                //Estimate missing delivery date
                if (store.DtPopsBaseDeliveryDate === '') {
                    delivery = install.add(-2, 'days');
                    notice += "\r\nDelivery Date estimated at 2 days before install";
                }

                //Check to see if delivery date is set
                if (store.DtPopsBaseDeliveryDate === '') {
                    if (install.diff(today, 'days') <= 30) return { severity: 3, description: 'Critical: DT POPS Base delivery date not set within 30 days of install' + notice };
                    if (install.diff(today, 'days') <= 45) return { severity: 2, description: 'Warning: DT POPS Base delivery date not set within 45 days of install' + notice };
                    return { severity: 1, description: '' };
                } else {
                    //Check to see if the install is at least 5 days before the opening (and in general before the opening)
                    var delivery = moment(store.DtPopsBaseDeliveryDate);
                    var shipped = contains(store.DtPopsBaseStatus, ['shipped', 'delivered']);

                    if (install.diff(delivery, 'days') < 0 && !shipped) return { severity: 3, description: 'Critical: DT POPS Base delivery date after install date' + notice };
                    if (install.diff(delivery, 'days') === 0 && !shipped) return { severity: 2, description: 'Warning: DT POPS Base delivery on same day as install date' + notice };
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'DtPopsBaseStatus',
            category: 'POPS',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = moment(store.InstallDate),
                    delivery = moment(store.DtPopsBaseDeliveryDate),
                    notice = '';

                if (contains(store.DtPopsBaseStatus, 'not required') || store.DriveThruFormat === 'No')
                    return { severity: 1, description: '' };
                if (contains(store.DtPopsBaseStatus, 'delivered'))
                    return { severity: 0, description: '' };

                //Estimate missing Install Date
                if (store.InstallDate === '') {
                    install = moment(store.GoLiveDate).add(-10, 'days');
                    notice += "\r\nInstall Date estimated at 10 days before go-live";
                }
                //Estimate missing delivery date
                if (store.DtPopsBaseDeliveryDate === '') {
                    delivery = install.add(-2, 'weeks');
                    notice += "\r\nDelivery Date estimated at 2 weeks before install";
                }

                //Check delivery
                if (delivery.diff(today, 'days') <= 0 && !contains(store.DtPopsBaseStatus, 'delivered'))
                    return { severity: 3, description: 'Critical: DT POPS Base not delivered by delivery date' + notice };
                //Check Shipping
                if (delivery.diff(today, 'days') <= 5 && !contains(store.DtPopsBaseStatus, ['shipped', 'delivered']))
                    return { severity: 3, description: 'Critical: DT POPS Base not shipped within 5 days of delivery target' + notice };
                if (delivery.diff(today, 'days') <= 10 && !contains(store.DtPopsBaseStatus, ['shipped', 'delivered']))
                    return { severity: 2, description: 'Warning: DT POPS Base not shipped within 10 days of delivery target' + notice };
                //Check Requested
                if (delivery.diff(today, 'days') <= 15 && !contains(store.DtPopsBaseStatus, ['requested', 'po issued', 'shipped', 'delivered']))
                    return { severity: 3, description: 'Critical: DT POPS Base not requested within 15 days of delivery target' + notice };
                if (delivery.diff(today, 'days') <= 30 && !contains(store.DtPopsBaseStatus, ['requested', 'po issued', 'shipped', 'delivered']))
                    return { severity: 2, description: 'Warning: DT POPS Base not requested within 30 days of delivery target' + notice };
                //Check PO Issued
                if (delivery.diff(today, 'days') <= 15 && !contains(store.DtPopsBaseStatus, ['requested', 'po issued', 'shipped', 'delivered']))
                    return { severity: 3, description: 'Critical: DT POPS Base PO not issued within 15 days of delivery target' + notice };
                if (delivery.diff(today, 'days') <= 30 && !contains(store.DtPopsBaseStatus, ['requested', 'po issued', 'shipped', 'delivered']))
                    return { severity: 2, description: 'Critical: DT POPS Base PO not issued within 30 days of delivery target' + notice };
                //Check for order auth sent to FEE (Need Signature Status)
                if (delivery.diff(today, 'days') <= 45 && !contains(store.DtPopsBaseStatus, ['estimate to fee', 'need signature', 'po issued', 'requested', 'shipped', 'delivered']))
                    return { severity: 2, description: 'Critical: DT POPS Base order auth not provided to franchisee within 45 days of delivery target' + notice };

                return { severity: 1, description: '' };
            }
        },
    /**************Audio Related Rules**************/
        {
            field: 'AudioDeliveryDate',
            category: 'Audio',
            test: function (store) {
                //Ignore if not required
                if (contains(store.AudioStatus, 'not required'))
                    return { severity: 1, description: '' };

                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    notice = '';

                //Estimate missing Install Date
                if (store.InstallDate === '') {
                    install = moment(store.GoLiveDate).add(-10, 'days');
                    notice += "\r\nInstall Date estimated at 10 days before go-live";
                }

                //Check to see if delivery date is set
                if (store.AudioDeliveryDate === '') {
                    if (install.diff(today, 'days') <= 30) return { severity: 3, description: 'Critical: Audio delivery date not set within 30 days of install' + notice };
                    if (install.diff(today, 'days') <= 45) return { severity: 2, description: 'Warning: Audio delivery date not set within 45 days of install' + notice };
                    return { severity: 1, description: '' };
                } else {
                    //Check to see if the install is at least 5 days before the opening (and in general before the opening)
                    var delivery = moment(store.AudioDeliveryDate);
                    var shipped = contains(store.AudioStatus, ['shipped', 'delivered']);

                    if (install.diff(delivery, 'days') < 0 && !shipped) return { severity: 3, description: 'Critical: Audio delivery date after install date' + notice };
                    if (install.diff(delivery, 'days') === 0 && !shipped) return { severity: 2, description: 'Warning: Audio delivery on same day as install date' + notice };
                    if (install.diff(delivery, 'days') >= 10 && !shipped) return { severity: 3, description: 'Critical: Audio delivery 10 days or more before install date' + notice };
                    if (install.diff(delivery, 'days') >= 5 && !shipped) return { severity: 2, description: 'Warning: Audio delivery 5 days or more before install date' + notice };
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'AudioStatus',
            category: 'Audio',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = moment(store.InstallDate),
                    delivery = moment(store.AudioDeliveryDate),
                    notice = '';

                //Estimate missing Install Date
                if (store.InstallDate === '') {
                    install = moment(store.GoLiveDate).add(-10, 'days');
                    notice += "\r\nInstall Date estimated at 10 days before go-live";
                }
                //Estimate missing delivery date
                if (store.AudioDeliveryDate === '') {
                    delivery = install.add(-2, 'days');
                    notice += "\r\nDelivery Date estimated at 2 days before install";
                }

                if (contains(store.AudioStatus, 'not required'))
                    return { severity: 1, description: '' };
                if (contains(store.AudioStatus, 'delivered'))
                    return { severity: 0, description: '' };

                //Check delivery
                if (delivery.diff(today, 'days') <= 0 && !contains(store.AudioStatus, 'delivered'))
                    return { severity: 3, description: 'Critical: Audio not delivered by delivery date' + notice };
                //Check Shipping
                if (delivery.diff(today, 'days') <= 5 && !contains(store.AudioStatus, ['shipped', 'delivered']))
                    return { severity: 3, description: 'Critical: Audio not shipped within 5 days of delivery target' + notice };
                if (delivery.diff(today, 'days') <= 10 && !contains(store.AudioStatus, ['shipped', 'delivered']))
                    return { severity: 2, description: 'Warning: Audio not shipped within 10 days of delivery target' + notice };
                //Check Contract Completion
                if (delivery.diff(today, 'days') <= 15 && !contains(store.AudioStatus, ['contract complete', 'shipped', 'shipping', 'delivered']))
                    return { severity: 3, description: 'Critical: Audio contract not complete within 15 days of delivery target' + notice };
                if (delivery.diff(today, 'days') <= 30 && !contains(store.AudioStatus, ['contract complete', 'shipped', 'shipping', 'delivered']))
                    return { severity: 2, description: 'Critical: Audio contract not complete within 30 days of delivery target' + notice };
                //Check for quote issued
                if (delivery.diff(today, 'days') <= 45 && !contains(store.AudioStatus, ['quote to fee', 'need signature', 'need deposit', 'contract complete', 'shipped', 'shipping', 'delivered']))
                    return { severity: 2, description: 'Critical: Audio quote not provided to franchisee within 45 days of delivery target' + notice };

                return { severity: 1, description: '' + notice };
            }
        },
        {
            field: 'GroundLoopStatus',
            category: 'Audio',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = moment(store.InstallDate),
                    notice = '';

                //Estimate missing Install Date
                if (store.InstallDate === '') {
                    install = moment(store.GoLiveDate).add(-10, 'days');
                    notice += "\r\nInstall Date estimated at 10 days before go-live";
                }

                if (contains(store.GroundLoopStatus, ['not required', 'fee provided', 'delivered']))
                    return { severity: 1, description: '' };

                //Check delivery
                if (install.diff(today, 'days') <= 28 && !contains(store.GroundLoopStatus, 'delivered'))
                    return { severity: 3, description: 'Critical: Loop not delivered by 4 weeks from install' + notice };
                //Check Shipping
                if (install.diff(today, 'days') <= 35 && !contains(store.GroundLoopStatus, ['shipped', 'delivered']))
                    return { severity: 2, description: 'Warning: Loop not shipped by 5 weeks from install' + notice };
                //Check General Status
                if (install.diff(today, 'days') <= 42 && store.GroundLoopStatus === '')
                    return { severity: 2, description: 'Warning: Loop status not set by 6 weeks from install' + notice };

                return { severity: 1, description: '' + notice };
            }
        },
    /**************PAYS Related Rules**************/
        {
            field: 'PaysDeliveryDate',
            category: 'PAYS',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    notice = '';

                //Skip this if we aren't doing PAYS
                if (contains(store.CirronetStatus, ['not required', 'use existing', 'reuse', 're-use']))
                    return { severity: 1, description: '' };

                //Estimate missing delivery date
                if (store.PaysDeliveryDate === '') {
                    delivery = install.add(-2, 'days');
                    notice += "\r\nDelivery Date estimated at 2 days before install";
                }

                //Check to see if delivery date is set
                if (store.PaysDeliveryDate === '') {
                    if (install.diff(today, 'days') <= 30) return { severity: 3, description: 'Critical: POS Data delivery date not set within 30 days of install' + notice };
                    if (install.diff(today, 'days') <= 45) return { severity: 2, description: 'Warning: POS Data delivery date not set within 45 days of install' + notice };
                    return { severity: 1, description: '' };
                } else {
                    //Check to see if the install is at least 5 days before the opening (and in general before the opening)
                    var delivery = moment(store.PaysDeliveryDate);
                    var shipped = contains(store.CirronetStatus, ['shipped', 'delivered']);

                    if (install.diff(delivery, 'days') < 0 && !shipped) return { severity: 3, description: 'Critical: POS Data delivery date after install date' + notice };
                    if (install.diff(delivery, 'days') === 0 && !shipped) return { severity: 2, description: 'Warning: POS Data delivery on same day as install date' + notice };
                    if (install.diff(delivery, 'days') >= 10 && !shipped) return { severity: 3, description: 'Critical: POS Data delivery 10 days or more before install date' + notice };
                    if (install.diff(delivery, 'days') >= 5 && !shipped) return { severity: 2, description: 'Warning: POS Data delivery 5 days or more before install date' + notice };
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'OADate',
            category: 'PAYS',
            test: function (store) {
                
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                              goLive = moment(store.GoLiveDate);
                
                if (today.diff(goLive, 'days') <= 7 && today.diff(goLive, 'days') >= 0 && !store.OADate) {

                    return { severity: 3, description: 'Critical: Missing OA Date 7 days after go-live or blank' };
          
                }
                else
                    return { severity: 1, description: '' };

            }
        },
        {
            field: 'CirronetStatus',
            category: 'PAYS',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = moment(store.InstallDate),
                    delivery = moment(store.PaysDeliveryDate),
                    notice = '';

                if (contains(store.CirronetStatus, ['not required', 'use existing', 'reuse', 're-use']))
                    return { severity: 1, description: '' };
                if (contains(store.CirronetStatus, 'delivered'))
                    return { severity: 0, description: '' };

                //Estimate missing Install Date
                if (store.InstallDate === '') {
                    install = moment(store.GoLiveDate).add(-10, 'days');
                    notice += "\r\nInstall Date estimated at 10 days before go-live";
                }
                //Estimate missing delivery date
                if (store.PaysDeliveryDate === '') {
                    delivery = install.add(-2, 'days');
                    notice += "\r\nDelivery Date estimated at 2 days before install";
                }

                //Check delivery
                if (delivery.diff(today, 'days') <= 0 && !contains(store.CirronetStatus, 'delivered'))
                    return { severity: 3, description: 'Critical: POS Data not delivered by delivery date' + notice };
                //Check Shipping
                if (delivery.diff(today, 'days') <= 5 && !contains(store.CirronetStatus, ['shipped', 'delivered']))
                    return {
                        severity: 3,
                        description: 'Critical: POS Data not shipped within 5 days of delivery target' + notice
                    };
                if (delivery.diff(today, 'days') <= 10 && !contains(store.CirronetStatus, ['shipped', 'delivered']))
                    return {
                        severity: 2,
                        description: 'Warning: POS Data not shipped within 10 days of delivery target' + notice
                    };
                //Check Requested
                if (delivery.diff(today, 'days') <= 15 && !contains(store.CirronetStatus, ['requested', 'shipped', 'shipping', 'delivered']))
                    return {
                        severity: 3,
                        description: 'Critical: POS Data not requested within 15 days of delivery target' + notice
                    };
                if (delivery.diff(today, 'days') <= 30 && !contains(store.CirronetStatus, ['requested', 'shipped', 'shipping', 'delivered']))
                    return {
                        severity: 2,
                        description: 'Critical: POS Data not requested within 30 days of delivery target' + notice
                    };
                //Check for order auth sent to FEE (Need Signature Status)
                if (delivery.diff(today, 'days') <= 45 && !contains(store.CirronetStatus, ['estimate to fee', 'need signature', 'requested', 'shipped', 'shipping', 'delivered']))
                    return {
                        severity: 2,
                        description: 'Critical: POS Data order auth not provided to franchisee within 45 days of delivery target' + notice
                    };

                return { severity: 1, description: '' };
            }
        },
        {
            field: 'ServerEps',
            category: 'PAYS',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = moment(store.InstallDate),
                    notice = '';

                if (contains(store.ServerEps, 'not required'))
                    return { severity: 1, description: '' };
                if (contains(store.ServerEps, 'complete'))
                    return { severity: 0, description: '' };

                //Estimate missing Install Date
                if (store.InstallDate === '') {
                    install = moment(store.GoLiveDate).add(-10, 'days');
                    notice += "\r\nInstall Date estimated at 10 days before go-live";
                }

                //Check Completion
                if (install.diff(today, 'days') <= 0 && !contains(store.ServerEps, 'complete'))
                    return { severity: 3, description: 'Critical: ServerEPS not setup by install date' + notice };
                if (install.diff(today, 'days') <= 7 && !contains(store.ServerEps, 'complete'))
                    return { severity: 3, description: 'Critical: ServerEPS not setup within a week of install date' + notice };

                //Check requested
                if (install.diff(today, 'days') <= 14 && !contains(store.ServerEps, ['complete', 'requested', 'submitted']))
                    return { severity: 3, description: 'Critical: ServerEPS not submitted for setup within 2 weeks of install date' + notice };
                if (install.diff(today, 'days') <= 28 && !contains(store.ServerEps, ['complete', 'requested', 'submitted']))
                    return { severity: 2, description: 'Warning: ServerEPS not submitted for setup within 4 weeks of install date' + notice };

                return { severity: 1, description: '' };
            }
        },
        {
            field: 'MerchantId',
            category: 'PAYS',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = moment(store.InstallDate),
                    notice = '',
                    complete = ($.isNumeric($.trim(store.MerchantId)) && ($.trim(store.MerchantId).length === 5 || $.trim(store.MerchantId).length === 6));

                if (contains(store.MerchantId, 'not required'))
                    return { severity: 1, description: '' };
                if (complete) {
                    return { severity: 0, description: '' };
                }

                //Estimate missing Install Date
                if (store.InstallDate === '') {
                    install = moment(store.GoLiveDate).add(-10, 'days');
                    notice += "\r\nInstall Date estimated at 10 days before go-live";
                }

                //Check Completion
                if (install.diff(today, 'days') <= 0)
                    return { severity: 3, description: 'Critical: Merchant ID not setup by install date' + notice };
                if (install.diff(today, 'days') <= 14)
                    return { severity: 3, description: 'Critical: Merchant ID not setup within 2 weeks of install date' + notice };

                //Check submission
                if (install.diff(today, 'days') <= 28 && !contains(store.MerchantId, 'submitted'))
                    return { severity: 3, description: 'Critical: Merchant ID not submitted for setup within 4 weeks of install date' + notice };
                if (install.diff(today, 'days') <= 42 && !contains(store.MerchantId, 'submitted'))
                    return { severity: 2, description: 'Warning: Merchant ID not submitted for setup within 6 weeks of install date' + notice };

                return { severity: 1, description: '' };
            }
        },
    /**************DMB Related Rules**************/
        {
            field: 'DmbTvDeliveryDate',
            category: 'DMB',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate));

                if (contains(store.DmbTvStatus, 'not required'))
                    return { severity: 1, description: '' };

                //Check to see if delivery date is set
                if (store.DmbTvDeliveryDate === '') {
                    if (install.diff(today, 'days') <= 45) return { severity: 3, description: 'Critical: DMB delivery date not set within 45 days of install' };
                    if (install.diff(today, 'days') <= 60) return { severity: 2, description: 'Warning: DMB delivery date not set within 60 days of install' };
                    return { severity: 1, description: '' };
                } else {
                    //Check to see if the install is at least 5 days before the opening (and in general before the opening)
                    var delivery = moment(store.DmbTvDeliveryDate);
                    var shipped = contains(store.DmbTvStatus, ['shipped', 'delivered'])

                    if (install.diff(delivery, 'days') < 0 && !shipped) return { severity: 3, description: 'Critical: DMB delivery date after install date' };
                    if (install.diff(delivery, 'days') === 0 && !shipped) return { severity: 2, description: 'Warning: DMB delivery on same day as install date' };
                    if (install.diff(delivery, 'days') >= 10 && !shipped) return { severity: 3, description: 'Critical: DMB delivery 10 days or more before install date' };
                    if (install.diff(delivery, 'days') >= 5 && !shipped) return { severity: 2, description: 'Warning: DMB delivery 5 days or more before install date' };
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'DmbTvStatus',
            category: 'DMB',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    delivery = (store.DmbTvDeliveryDate === '' ? install.add(-2, 'days') : moment(store.DmbTvDeliveryDate));

                if (contains(store.DmbTvStatus, 'not required'))
                    return { severity: 1, description: '' };
                if (contains(store.DmbTvStatus, 'delivered'))
                    return { severity: 0, description: '' };

                //Check delivery
                if (delivery.diff(today, 'days') <= 0 && !contains(store.DmbTvStatus, 'delivered'))
                    return { severity: 3, description: 'Critical: DMB not delivered by delivery date' };
                //Check Shipping
                if (delivery.diff(today, 'days') <= 5 && !contains(store.DmbTvStatus, ['shipped', 'delivered']))
                    return { severity: 3, description: 'Critical: DMB not shipped within 5 days of delivery target' };
                if (delivery.diff(today, 'days') <= 10 && !contains(store.DmbTvStatus, ['shipped', 'shipping', 'delivered']))
                    return { severity: 2, description: 'Warning: DMB not shipped within 10 days of delivery target' };
                //Check Contract Completion
                if (delivery.diff(today, 'days') <= 15 && !contains(store.DmbTvStatus, ['contract complete', 'shipped', 'shipping', 'delivered']))
                    return { severity: 3, description: 'Critical: DMB contract not complete within 15 days of delivery target' };
                if (delivery.diff(today, 'days') <= 30 && !contains(store.DmbTvStatus, ['contract complete', 'shipped', 'shipping', 'delivered']))
                    return { severity: 2, description: 'Critical: DMB contract not complete within 30 days of delivery target' };
                //Check for quote issued
                if (delivery.diff(today, 'days') <= 45 && !contains(store.DmbTvStatus, ['quote to fee', 'need signature', 'need deposit', 'contract complete', 'shipped', 'shipping', 'delivered']))
                    return { severity: 2, description: 'Critical: DMB quote not provided to franchisee within 45 days of delivery target' };

                return { severity: 1, description: '' };
            }
        },
        {
            field: 'DmbContentCreated',
            category: 'DMB',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    delivery = (store.DmbTvDeliveryDate === '' ? install.add(-2, 'days') : moment(store.DmbTvDeliveryDate));

                if (contains(store.DmbContentCreated, 'not required') || contains(store.DmbTvStatus, 'not required'))
                    return { severity: 1, description: '' };
                if (contains(store.DmbContentCreated, 'created'))
                    return { severity: 0, description: '' };

                //Check content creation
                if (install.diff(today, 'days') <= 0 && !contains(store.DmbContentCreated, 'created'))
                    return { severity: 3, description: 'Critical: DMB content not created by install date' };
                if (install.diff(today, 'days') <= 5 && !contains(store.DmbContentCreated, ['created']))
                    return { severity: 3, description: 'Critical: DMB content not created within 5 days of install target' };
                if (install.diff(today, 'days') <= 10 && !contains(store.DmbContentCreated, ['created']))
                    return { severity: 2, description: 'Warning: DMB content not created within 10 days of install target' };
                //Check content request
                if (install.diff(today, 'days') <= 15 && !contains(store.DmbContentCreated, ['created', 'requested']))
                    return { severity: 3, description: 'Critical: DMB content not requested within 15 days of install target' };
                if (install.diff(today, 'days') <= 30 && !contains(store.DmbContentCreated, ['created', 'requested']))
                    return { severity: 2, description: 'Critical: DMB content not requested within 30 days of install target' };

                return { severity: 1, description: '' };
            }
        },


    /**************Sonic Radio Related Rules**************/
        {
            field: 'SonicRadioDeliveryDate',
            category: 'SonicRadio',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    notice = '';

                //Skip this if we aren't doing PAYS
                if (contains(store.SonicRadioStatus, ['Installer Provided', 'not required', 'use existing', 'reuse', 're-use']))
                    return { severity: 1, description: '' };

                //Estimate missing delivery date
                if (store.SonicRadioDeliveryDate === '') {
                    delivery = install.add(-2, 'days');
                    notice += "\r\nDelivery Date estimated at 2 days before install";
                }

                //Check to see if delivery date is set
                if (store.SonicRadioDeliveryDate === '') {
                    if (install.diff(today, 'days') <= 30) return { severity: 3, description: 'Critical: Sonic Radio delivery date not set within 30 days of install' + notice };
                    if (install.diff(today, 'days') <= 45) return { severity: 2, description: 'Warning: Sonic Radio delivery date not set within 45 days of install' + notice };
                    return { severity: 1, description: '' };
                } else {
                    //Check to see if the install is at least 5 days before the opening (and in general before the opening)
                    var delivery = moment(store.SonicRadioDeliveryDate);
                    var shipped = contains(store.SonicRadioStatus, ['shipped', 'delivered']);

                    if (install.diff(delivery, 'days') < 0 && !shipped) return { severity: 3, description: 'Critical: Sonic Radio delivery date after install date' + notice };
                    if (install.diff(delivery, 'days') === 0 && !shipped) return { severity: 2, description: 'Warning: Sonic Radio delivery on same day as install date' + notice };
                    if (install.diff(delivery, 'days') >= 10 && !shipped) return { severity: 3, description: 'Critical: Sonic Radio delivery 10 days or more before install date' + notice };
                    if (install.diff(delivery, 'days') >= 5 && !shipped) return { severity: 2, description: 'Warning: Sonic Radio delivery 5 days or more before install date' + notice };
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'SonicRadioStatus',
            category: 'SonicRadio',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = moment(store.InstallDate),
                    delivery = moment(store.SonicRadioDeliveryDate),
                    notice = '';

                if (contains(store.SonicRadioStatus, ['Contract Complete']))
                    return { severity: 1, description: '' };
                if (contains(store.SonicRadioStatus, ['Installer Provided', 'not required', 'use existing', 'reuse', 're-use']))
                    return { severity: 1, description: '' };
                if (contains(store.SonicRadioStatus, 'delivered'))
                    return { severity: 0, description: '' };

                //Estimate missing Install Date
                if (store.InstallDate === '') {
                    install = moment(store.GoLiveDate).add(-10, 'days');
                    notice += "\r\nInstall Date estimated at 10 days before go-live";
                }
                //Estimate missing delivery date
                if (store.SonicRadioDeliveryDate === '') {
                    delivery = install.add(-2, 'days');
                    notice += "\r\nDelivery Date estimated at 2 days before install";
                }

                //Check delivery
                if (delivery.diff(today, 'days') <= 0 && !contains(store.SonicRadioStatus, 'delivered'))
                    return { severity: 3, description: 'Critical: Sonic Radio not delivered by delivery date' + notice };
                //Check Shipping
                if (delivery.diff(today, 'days') <= 5 && !contains(store.SonicRadioStatus, ['shipped', 'delivered']))
                    return {
                        severity: 3,
                        description: 'Critical: Sonic Radio not shipped within 5 days of delivery target' + notice
                    };
                if (delivery.diff(today, 'days') <= 10 && !contains(store.SonicRadioStatus, ['shipped', 'delivered']))
                    return {
                        severity: 2,
                        description: 'Warning: Sonic Radio not shipped within 10 days of delivery target' + notice
                    };
                //Check Requested
                if (delivery.diff(today, 'days') <= 15 && !contains(store.SonicRadioStatus, ['requested', 'shipped', 'shipping', 'delivered']))
                    return {
                        severity: 3,
                        description: 'Critical: Sonic Radio not requested within 15 days of delivery target' + notice
                    };
                if (delivery.diff(today, 'days') <= 30 && !contains(store.SonicRadioStatus, ['requested', 'shipped', 'shipping', 'delivered']))
                    return {
                        severity: 2,
                        description: 'Critical: Sonic Radio not requested within 30 days of delivery target' + notice
                    };
                //Check for order auth sent to FEE (Need Signature Status)
                if (delivery.diff(today, 'days') <= 45 && !contains(store.SonicRadioStatus, ['estimate to fee', 'need signature', 'requested', 'shipped', 'shipping', 'delivered']))
                    return {
                        severity: 2,
                        description: 'Critical: Sonic Radio order auth not provided to franchisee within 45 days of delivery target' + notice
                    };

                return { severity: 1, description: '' };
            }
        },
    /**************Hughes Related Rules**************/
        {
            field: 'HughesTempDate',
            category: 'Connectivity',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate));

                if (contains(store.HughesTempStatus, ['not required', 'complete']))
                    return { severity: 1, description: '' };

                //Check to see if delivery date is set
                if (store.HughesTempDate === '') {
                    if (install.diff(today, 'days') <= 45) return { severity: 3, description: 'Critical: Temp 4G install date not set within 45 days of install' };
                    if (install.diff(today, 'days') <= 60) return { severity: 2, description: 'Warning: Temp 4G install date not set within 60 days of install' };
                    return { severity: 1, description: '' };
                } else {
                    //Check to see if the install is at least 5 days before the opening (and in general before the opening)
                    var han = moment(store.HughesTempDate);

                    if (install.diff(han, 'days') < 0) return { severity: 3, description: 'Critical: Temp 4G  install after install date' };
                    if (install.diff(han, 'days') === 0) return { severity: 2, description: 'Warning: Temp 4G install on same day as install date' };
                    if (install.diff(han, 'days') >= 14) return { severity: 2, description: 'Warning: Temp 4G install 2 weeks or more before install date' };
                    if (install.diff(han, 'days') >= 28) return { severity: 3, description: 'Critical: Temp 4G install 4 weeks or more before install date' };
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'HughesTempStatus',
            category: 'Connectivity',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    han = (store.HughesTempDate === '' ? install.add(-7, 'days') : moment(store.HughesTempDate));

                if (contains(store.HughesTempStatus, 'not required'))
                    return { severity: 1, description: '' };
                if (contains(store.HughesTempStatus, 'complete'))
                    return { severity: 0, description: '' };

                //Check completion
                if (han.diff(today, 'days') <= 0 && !contains(store.HughesTempStatus, 'completed'))
                    return { severity: 3, description: 'Critical: Temp 4G not complete by Temp 4G install date' };
                //Check Confirmed
                if (han.diff(today, 'days') <= 5 && !contains(store.HughesTempStatus, ['confirmed', 'completed']))
                    return { severity: 3, description: 'Critical: Temp 4G not confirmed within 5 days of Temp 4G install' };
                if (han.diff(today, 'days') <= 10 && !contains(store.HughesTempStatus, ['confirmed', 'completed']))
                    return { severity: 2, description: 'Warning: Temp 4G not confirmed within 10 days of Temp 4G install' };
                //Check HAN Submitted
                if (han.diff(today, 'days') <= 15 && !contains(store.HughesTempStatus, ['submitted', 'tentative', 'confirmed', 'completed']))
                    return { severity: 3, description: 'Critical: HAN not submitted within 15 days of Temp 4G install' };
                if (han.diff(today, 'days') <= 30 && !contains(store.HughesTempStatus, ['submitted', 'tentative', 'confirmed', 'completed']))
                    return { severity: 2, description: 'Warning: HAN not submitted within 30 days of Temp 4G install' };

                return { severity: 1, description: '' };
            }
        },
        {
            field: 'HughesVsatDate',
            category: 'Connectivity',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate));

                if (contains(store.HughesVsatStatus, ['not required', 'complete']))
                    return { severity: 1, description: '' };

                //Check to see if delivery date is set
                if (store.HughesVsatDate === '') {
                    if (install.diff(today, 'days') <= 45) return { severity: 3, description: 'Critical: VSAT install date not set within 45 days of install' };
                    if (install.diff(today, 'days') <= 60) return { severity: 2, description: 'Warning: VSAT install date not set within 60 days of install' };
                    return { severity: 1, description: '' };
                } else {
                    //Check to see if the install is at least 5 days before the opening (and in general before the opening)
                    var han = moment(store.HughesVsatDate);

                    if (install.diff(han, 'days') < 0) return { severity: 3, description: 'Critical: VSAT  install after install date' };
                    if (install.diff(han, 'days') === 0) return { severity: 2, description: 'Warning: VSAT install on same day as install date' };
                    if (install.diff(han, 'days') >= 14) return { severity: 2, description: 'Warning: VSAT install 2 weeks or more before install date' };
                    if (install.diff(han, 'days') >= 28) return { severity: 3, description: 'Critical: VSAT install 4 weeks or more before install date' };
                    return { severity: 1, description: '' };
                }
            }
        },
        {
            field: 'HughesVsatStatus',
            category: 'Connectivity',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate)),
                    han = (store.HughesVsatDate === '' ? install.add(-7, 'days') : moment(store.HughesVsatDate));

                if (contains(store.HughesVsatStatus, 'not required'))
                    return { severity: 1, description: '' };
                if (contains(store.HughesVsatStatus, 'complete'))
                    return { severity: 0, description: '' };

                //Check completion
                if (han.diff(today, 'days') <= 0 && !contains(store.HughesVsatStatus, 'completed'))
                    return { severity: 3, description: 'Critical: VSAT not complete by VSAT install date' };
                //Check Confirmed
                if (han.diff(today, 'days') <= 5 && !contains(store.HughesVsatStatus, ['confirmed', 'completed']))
                    return { severity: 3, description: 'Critical: VSAT not confirmed within 5 days of VSAT install' };
                if (han.diff(today, 'days') <= 10 && !contains(store.HughesVsatStatus, ['confirmed', 'completed']))
                    return { severity: 2, description: 'Warning: VSAT not confirmed within 10 days of VSAT install' };
                //Check HAN Submitted
                if (han.diff(today, 'days') <= 15 && !contains(store.HughesVsatStatus, ['tentative', 'confirmed', 'completed']))
                    return { severity: 3, description: 'Critical: VSAT not scheduled (tentative or confirmed) within 15 days of VSAT install' };
                if (han.diff(today, 'days') <= 30 && !contains(store.HughesVsatStatus, ['tentative', 'confirmed', 'completed']))
                    return { severity: 2, description: 'Warning: VSAT not scheduled (tentative or confirmed) within 30 days of VSAT install' };

                return { severity: 1, description: '' };
            }
        },
        {
            field: 'HughesPrimaryStatus',
            category: 'Connectivity',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    live = moment(store.GoLiveDate);

                if (contains(store.HughesPrimaryStatus, 'not required'))
                    return { severity: 1, description: '' };
                if (contains(store.HughesPrimaryStatus, 'complete'))
                    return { severity: 0, description: '' };


                //Check status vs install date if it exists, otherwise just confirm a primary is scheduled within a month of go-live
                if (store.HughesPrimaryDate !== '') {
                    var han = moment(store.HughesPrimaryDate);
                    //Check Complete
                    if (han.diff(today, 'days') <= 0 && !contains(store.HughesPrimaryStatus, 'completed'))
                        return { severity: 3, description: 'Critical: Primary not complete by Primary install date' };
                    //Check Confirmed
                    if (han.diff(today, 'days') <= 5 && !contains(store.HughesPrimaryStatus, ['confirmed', 'completed']))
                        return { severity: 3, description: 'Critical: Primary not confirmed by Primary install date' };
                    if (han.diff(today, 'days') <= 10 && !contains(store.HughesPrimaryStatus, ['confirmed', 'completed']))
                        return { severity: 3, description: 'Warning: Primary not confirmed by Primary install date' };
                    //Check scheduled
                    if (han.diff(today, 'days') <= 15 && !contains(store.HughesPrimaryStatus, ['tentative', 'confirmed', 'completed']))
                        return { severity: 3, description: 'Critical: Primary not scheduled (tentative or confirmed) within 15 days of Primary install' };
                    if (han.diff(today, 'days') <= 30 && !contains(store.HughesPrimaryStatus, ['tentative', 'confirmed', 'completed']))
                        return { severity: 2, description: 'Warning: Primary not scheduled (tentative or confirmed) within 30 days of Primary install' };

                    return { severity: 1, description: '' };
                }

                //Check completion by 30 days after install
                if (today.diff(live, 'days') >= 30 && !contains(store.HughesPrimaryStatus, 'completed'))
                    return { severity: 3, description: 'Critical: Primary not complete within 30 days after go-live' };
                //Check Confirmed
                if (today.diff(live, 'days') >= 25 && !contains(store.HughesPrimaryStatus, ['completed', 'confirmed']))
                    return { severity: 3, description: 'Critical: Primary not confirmed within 25 days after go-live' };
                if (today.diff(live, 'days') >= 20 && !contains(store.HughesPrimaryStatus, ['completed', 'confirmed']))
                    return { severity: 3, description: 'Critical: Primary not confirmed within 20 days after go-live' };
                //Check scheduled
                if (today.diff(live, 'days') >= 0 && !contains(store.HughesPrimaryStatus, ['completed', 'confirmed', 'tentative']))
                    return { severity: 2, description: 'Warning: Primary not scheduled within 10 days after go-live' };

                //Check to confirm that pre-qualification was initiated
                if (live.diff(today, 'days') <= 15 && !contains(store.HughesPrimaryStatus, ['completed', 'confirmed', 'tentative', 'pending prequal']))
                    return { severity: 3, description: 'Critical: Pre-qualification for primary not requested within 15 days of go-live' };
                if (live.diff(today, 'days') <= 30 && !contains(store.HughesPrimaryStatus, ['completed', 'confirmed', 'tentative', 'pending prequal']))
                    return { severity: 2, description: 'Warning: Pre-qualification for primary not requested within 30 days of go-live' };

                return { severity: 1, description: '' };
            }
        },
        {
            field: 'HughesDeinstalDate',
            category: 'Connectivity',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate));

                if (contains(store.HughesDeinstallStatus, ['not required', 'complete']))
                    return { severity: 1, description: '' };

                //Check to see if date is set
                if (store.HughesDeinstallDate === '') {
                    if (install.diff(today, 'days') <= 45) return { severity: 3, description: 'Critical: De-install date not set within 45 days of install' };
                    if (install.diff(today, 'days') <= 75) return { severity: 2, description: 'Warning: De-install date not set within 75 days of install' };
                }

                return { severity: 1, description: '' };
            }
        },
        {
            field: 'HughesDeinstallStatus',
            category: 'Connectivity',
            test: function (store) {
                var today = moment().set('hour', 0).set('minute', 0).set('second', 0),
                    install = (store.InstallDate === '' ? moment(store.GoLiveDate).add(-10, 'days') : moment(store.InstallDate));

                if (contains(store.HughesDeinstallStatus, 'not required'))
                    return { severity: 1, description: '' };
                if (contains(store.HughesDeinstallStatus, 'complete'))
                    return { severity: 0, description: '' };

                if (store.HughesDeinstallDate !== '') {
                    var han = moment(store.HughesDeinstallDate);

                    //Check completion
                    if (han.diff(today, 'days') <= 0 && !contains(store.HughesDeinstallStatus, 'completed'))
                        return { severity: 3, description: 'Critical: De-install not complete by De-install install date' };
                    //Check Confirmed
                    if (han.diff(today, 'days') <= 5 && !contains(store.HughesDeinstallStatus, ['confirmed', 'completed']))
                        return { severity: 3, description: 'Critical: De-install not confirmed within 5 days of De-install install' };
                    if (han.diff(today, 'days') <= 10 && !contains(store.HughesDeinstallStatus, ['confirmed', 'completed']))
                        return { severity: 2, description: 'Warning: De-install not confirmed within 10 days of De-install install' };
                    //Check HAN Submitted
                    if (han.diff(today, 'days') <= 15 && !contains(store.HughesDeinstallStatus, ['tentative', 'confirmed', 'completed']))
                        return { severity: 3, description: 'Critical: De-install not scheduled (tentative or confirmed) within 15 days of De-install install' };
                    if (han.diff(today, 'days') <= 30 && !contains(store.HughesDeinstallStatus, ['tentative', 'confirmed', 'completed']))
                        return { severity: 2, description: 'Warning: De-install not scheduled (tentative or confirmed) within 30 days of De-install install' };

                    return { severity: 1, description: '' };
                } else {
                    if (install.diff(today, 'days') <= 45) return { severity: 3, description: 'Critical: De-install date not set within 45 days of install' };
                    if (install.diff(today, 'days') <= 75) return { severity: 2, description: 'Warning: De-install date not set within 75 days of install' };
                    return { severity: 1, description: '' };
                }
            }
        },
    /**************Notes Related Rules**************/
        {
            field: 'OldNotes',
            category: 'Notes',
            test: function (store) {
                if (contains(store.OldNotes, '^^'))
                    return { severity: 3, description: 'Critical: See line denoted with a "^^" character for details' };

                if (contains(store.OldNotes, '^'))
                    return { severity: 2, description: 'Warning: See line denoted with a "^" character for details' };

                return { severity: 1, description: '' };
            }
        },
    ];

    /**
     * Function that recieves a dom element and a store/project object and highlights based on business rules and data-editable or data-display fields
     * @param target - DOM or jquery element with data-display or data-editable fields in it
     * @param store - object containing all store/project information for a construction project
     */
    function helper(target, store) {
        var $target = target;

        function setHighlightClass($el, rule) {
            //Green
            if (rule.severity === 0) $el.addClass('green-highlight');
            else $el.removeClass('green-highlight');
            //Yellow
            if (rule.severity === 2) $el.addClass('yellow-highlight');
            else $el.removeClass('yellow-highlight');
            //Red
            if (rule.severity === 3) $el.addClass('red-highlight');
            else $el.removeClass('red-highlight');

            //Set title
            $el.prop('title', rule.description);
        }

        //@TODO To turn this into a utility function in the rules folder - need to pass in the element we are checking in, the store object, and the rules....or add to the construction rules object as rules.helper and put the rules in rules.rules
        var issues = {};
        _.each(rules, function (rule) {
            //Test the rule:
            var result = rule.test(store);

            //Create the category
            if (typeof issues[rule.category] === 'undefined') {
                issues[rule.category] = {
                    severity: 1,
                    description: ''
                }
            }

            //Update category
            if (result.severity > 1) {
                //Update severity
                issues[rule.category].severity = (issues[rule.category].severity < result.severity ? result.severity : issues[rule.category].severity);
                //Update text
                issues[rule.category].description += result.description + "\r\n";
            } else if (issues[rule.category].severity === 1 && result.severity === 0) {
                //Update severity
                issues[rule.category].severity = result.severity;
                //Update text
                issues[rule.category].description += result.description + "\r\n";
            }

            //Highlight accordingly
            //Check to see if it's a display field onscreen (merge the selected field and it's label div into a single jquery collection - may need to add a data-label attribute to these....or actually use inputs and labels)
            var $el = $target.find('*[data-display="' + rule.field + '"]');
            setHighlightClass($el.add($el.prev('.summary-box-label')).add($el.prev('.review-label')), result);


            //Highlight editable field
            $el = $target.find('*[data-editable="' + rule.field + '"]');
            setHighlightClass($el.add($el.prev('.summary-box-label')).add($el.prev('.review-label')), result);
        });

        //Update any data-category fields
        _.each(issues, function (category, key) {
            setHighlightClass($target.find('*[data-category=' + key + ']'), category);
        });
    }

    function tableHelper(view) {
        //Go through each row of the table and run rules on only that target/store info
        _.forEach(view.stores, function (store, storeIndex) {
            //Grab the row el
            var $el = $(view.el).find('#number' + store.StoreNumber);
            //Call the helper function for that target
            helper($el, store);
        });
    }
    function tableChangeHelper(view, key, value, store, revertBackground, response) {
        //Revert the background/unlock the field
        revertBackground();

        //Rerun the business rules on change to update the view for just the relevant table row for the store
        //Grab the row el
        var $el = $(view.el).find('#number' + store.StoreNumber);
        //Call the helper function for that target
        helper($el, store);
    }

    return {
        helper: helper,
        tableHelper: tableHelper,
        tableChangeHelper: tableChangeHelper,
        rules: rules
    };
});

function contains(source, test) {
    //Make sure it's an array
    if (typeof test !== 'object') test = [test];
    //Check to see if one of the passed terms is contained in the source
    var flag = false;
    _.each(test, function (item, index) {
        if (source)
            if (source.toUpperCase().indexOf(item.toUpperCase()) !== -1) flag = true;
    });

    return flag;
}