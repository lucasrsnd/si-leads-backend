import { ApiProperty } from "@nestjs/swagger";
import { LeadStatus, Source, Priority } from "@prisma/client";
import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsPhoneNumber,
  MinLength,
} from "class-validator";

export class CreateLeadDto {
  @ApiProperty({ example: "Carlos Mendes" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false, example: "carlos@email.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: "(31) 99801-2345" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: LeadStatus, required: false, default: LeadStatus.NOVO })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({ enum: Source, required: false })
  @IsOptional()
  @IsEnum(Source)
  source?: Source;

  @ApiProperty({ enum: Priority, required: false, default: Priority.MEDIA })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
