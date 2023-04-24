#include <stdio.h>
#include <stdlib.h>
#include <time.h>
typedef struct
{
    int type;
    float val;
    long timestamp;
} ValueStruct;

typedef struct
{
    int type;
    float val[10];
    long timestamp;
} MValueStruct;

typedef struct
{
    int type;
    char message[21]; // stringa null terminated lung max 20
} MessageStruct;

typedef struct
{
    int type;
    union
    {
        ValueStruct val;
        MValueStruct mvals;
        MessageStruct messages;
    };
} ExportData;

// Function that creates a vector with 100 elements that has to be exported
void createData (ExportData *data){
    int type = data->type;
    switch (type)
    {
        case 1:
            data->val.type = 1;
            data->val.val = rand() % 100;
            data->val.timestamp = time(NULL);
            break;
        case 2:
            data->mvals.type = 2;
            for (int j = 0; j < 10; j++){
                data->mvals.val[j] = rand() % 100;
            }
            data->mvals.timestamp = time(NULL);
            break;
        case 3:
            data->messages.type = 3;
            for (int j = 0; j < 20; j++){
                data->messages.message[j] = rand() % 26 + 65;
            }
            break;
        default:
            break;
    }
}

void export(ExportData *data, int n, FILE *fp){
    fwrite(data, sizeof(ExportData), n, fp);
}

int main(){
    ExportData data[100] = {0};
    srand(time(NULL));
    for (int i = 0; i < 100; i++){
        data[i].type = rand() % 3 + 1;
        createData(&data[i]);
    }
    FILE *fp = fopen("data.bin", "wb");
    export(data, 100, fp);
    fclose(fp);
}