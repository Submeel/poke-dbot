const { google } = require('googleapis');
const spreadsheetId = '1DIE-7U2XbofeuB14y-3i2AG77SyAzlceFr8Tja9uWjs';
const sheets = google.sheets('v4');
const { client_email, private_key } = require('./praxis-life-402211-0b21fa9c8f94.json');

class SpreadsheetDataHandler {
    constructor() {
        this.sheetRecords = {};
        this.jwtClient = null;
    }


    async doAuth() {
        try {
            this.jwtClient = new google.auth.JWT(
                client_email,
                null,
                private_key,
                ['https://www.googleapis.com/auth/spreadsheets']
            );

            // 토큰 만료 여부 확인
            const auth = await this.jwtClient.authorize();
            if (!auth || !auth.access_token) {
                console.error('Failed to authenticate.');
            }
        } catch (err) {
            console.error('Error during authentication:', err);
        }
    }

    async ensureAuthentication() {
        // 토큰 만료 여부 확인
        if (!this.jwtClient.credentials || this.jwtClient.credentials.expiry_date <= new Date().getTime()) {
            // 토큰이 만료되었을 경우, 토큰을 갱신
            await this.doAuth();
        }

        return this.jwtClient;
    }

    async getAllSheetDataAsDictionaries() {
        try {
            await this.ensureAuthentication();
            const spreadsheetInfo = await sheets.spreadsheets.get({
                spreadsheetId,
                auth: this.jwtClient
            });

            const sheetsInfo = spreadsheetInfo.data.sheets;
            const allDataDictionaries = {};

            for (const sheet of sheetsInfo) {
                const sheetTitle = sheet.properties.title;
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: `${sheetTitle}`, // 시트 이름과 데이터 범위 설정
                    auth: this.jwtClient
                });


                const rows = response.data.values;
                if (rows.length) { // 빈 시트 잇으면 에러난다. 2줄 이상 없어도 에러난다.
                    const headerRow = rows[0]; // 첫 번째 행은 열 제목. 동일한 네이밍=키값이 있을 경우 에러가 난다
                    const dataDictionary = [];

                    for (let i = 2; i < rows.length; i++) { // 두번째 행은 설명이므로 포함하지 않는다. (설명값 작성하는 곳. 이걸 삭제한다면 1로 바꿔도 됨)
                        const rowData = rows[i];
                        const rowDataDict = {};

                        for (let j = 0; j < headerRow.length; j++) {
                            rowDataDict[headerRow[j]] = rowData[j];
                        }

                        dataDictionary.push(rowDataDict);
                    }

                    allDataDictionaries[sheetTitle] = dataDictionary;
                }
            }

            this.sheetRecords = allDataDictionaries;
        } catch (err) {
            console.error('Error:', err);
        }
    }

    async clearCells(sheetName, range) {
        try {
            await this.ensureAuthentication();

            const rng = `'${sheetName}'!${range}`;
            const request = {
                spreadsheetId: spreadsheetId,
                range: rng,
                auth: this.jwtClient
            };
            await sheets.spreadsheets.values.clear(request, (err, response) => {
                if (err) {
                    console.error(`Cannot update cells ${err}`);
                    return;
                }
                console.log(`Removal Successful : Cell in range ${response.data.clearedRange} was cleared.`);
            });
        } catch (error) {
            console.error('Error updating sheet data:', error);
        }
    }

    async updateCells(updateInfo) {
        console.log('updateCells 메소드입니다.');
        try {
            // 업데이트 로직   
            await this.ensureAuthentication();

            let request = null;
            for (const sheetName in updateInfo) {
                const updateContentDict = updateInfo[sheetName];
                for (const cell in updateContentDict) {
                    const updateContent = updateContentDict[cell];
                    console.log(sheetName, cell, updateContent);

                    const range = `'${sheetName}'!${cell}`;
                    const values = [[updateContent]];
                    const valueInputOption = 'RAW';

                    request = {
                        spreadsheetId: spreadsheetId,
                        range: range,
                        valueInputOption: valueInputOption,
                        resource: {
                            values: values
                        },
                        auth: this.jwtClient
                    }
                    // 업데이트 요청 보내기
                    await sheets.spreadsheets.values.update(request, (err, response) => {
                        if (err) {
                            console.error(`업데이트 중 오류 발생: ${err}`);
                            return;
                        }
                        console.log(`업데이트 완료: ${response.data.updatedCells} 개의 셀 업데이트됨`);
                    });
                }
            }


        } catch (error) {
            console.error('Error updating sheet data:', error);
        }
    }


    static getInstance() {
        if (!SpreadsheetDataHandler.instance) {
            SpreadsheetDataHandler.instance = new SpreadsheetDataHandler();
        }
        return SpreadsheetDataHandler.instance;
    }
}

module.exports = SpreadsheetDataHandler;