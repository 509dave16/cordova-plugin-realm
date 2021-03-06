/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import <Cordova/CDV.h>

typedef enum {
    ResultOperationTypeSum,
    ResultOperationTypeMin,
    ResultOperationTypeMax,
    ResultOperationTypeAverage
} ResultOperationType;

@interface RealmPlugin : CDVPlugin {
    NSMutableArray* realms;
    NSMutableArray* realmResults;
}
@property (nonatomic, strong) NSMutableArray* realms;
@property (nonatomic, strong) NSMutableArray* realmResults;

- (void)initialize:(CDVInvokedUrlCommand*)command;
- (void)create:(CDVInvokedUrlCommand*)command;
- (void)delete:(CDVInvokedUrlCommand*)command;
- (void)deleteAll:(CDVInvokedUrlCommand*)command;
- (void)findAll:(CDVInvokedUrlCommand*)command;
- (void)findAllSorted:(CDVInvokedUrlCommand*)command;
- (void)sort:(CDVInvokedUrlCommand*)command;
- (void)sum:(CDVInvokedUrlCommand*)command;
- (void)max:(CDVInvokedUrlCommand*)command;
- (void)min:(CDVInvokedUrlCommand*)command;
- (void)average:(CDVInvokedUrlCommand*)command;
@end
