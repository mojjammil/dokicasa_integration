import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpService {
  private client: AxiosInstance;
  constructor() {
    this.client = axios.create({ timeout: 30000 });
  }
  get instance(): AxiosInstance {
    return this.client;
  }
}
